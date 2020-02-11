import express, { Express, RequestHandler, NextFunction } from 'express';
import { ParamsDictionary, Response, Request } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import path from 'path';
import { Kayn } from 'kayn';
import {
  MatchV4MatchDTO,
  MatchV4ParticipantStatsDTO,
  MatchV4ParticipantDTO,
} from 'kayn/typings/dtos';

export type MatchInfo = Pick<
  MatchV4MatchDTO,
  'queueId' | 'gameCreation' | 'gameDuration'
> &
  Pick<
    MatchV4ParticipantStatsDTO,
    | 'perk0'
    | 'perkSubStyle'
    | 'win'
    | 'kills'
    | 'deaths'
    | 'assists'
    | 'champLevel'
    | 'totalMinionsKilled'
  > &
  Pick<MatchV4ParticipantDTO, 'championId' | 'runes' | 'spell1Id' | 'spell2Id'>;

export const setupApp = (app: Express) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(express.static(path.join(__dirname, '../build')));

  app.get('/ping', function(req, res) {
    return res.send('pong');
  });

  const wrap = (fn: RequestHandler<ParamsDictionary>) => (
    ...args: [
      Request<ParamsDictionary>,
      Response<ParamsDictionary>,
      NextFunction,
    ]
  ) => fn(...args).catch(args[2]);

  app.get(
    '/search',
    wrap(async (req, res) => {
      const name = req.query.summoner;
      const kayn = Kayn(process.env.RIOT_API)();

      // error thrown if not found
      try {
        const encryptedId = (await kayn.Summoner.by.name(name)).accountId!;
        // what if matches don't exist?
        const matches =
          (
            await kayn.Matchlist.by
              .accountID(encryptedId)
              .query({ endIndex: 6 })
          ).matches || [];

        const data = [];

        for (const match of matches) {
          // what if match id doesn't exist
          const matchResult = await kayn.Match.get(match.gameId!);
          const participantId = matchResult.participantIdentities!.find(id => {
            return id.player!.accountId === encryptedId;
          })!.participantId!;

          const participant = matchResult.participants!.find(participant => {
            return participant.participantId === participantId;
          })!;

          const result: MatchInfo = {
            queueId: matchResult.queueId!,
            gameCreation: matchResult.gameCreation!,
            win: participant.stats!.win!,
            gameDuration: matchResult.gameDuration!,
            championId: participant.championId!,
            runes: participant.runes,
            perk0: participant.stats!.perk0,
            perkSubStyle: participant.stats!.perkSubStyle,
            spell1Id: participant.spell1Id!,
            spell2Id: participant.spell2Id!,
            kills: participant.stats!.kills!,
            deaths: participant.stats!.deaths!,
            assists: participant.stats!.assists!,
            champLevel: participant.stats!.champLevel!,
            totalMinionsKilled: participant.stats!.totalMinionsKilled!,
          };

          data.push(result);

          console.log(result);
        }

        res.send(data);
      } catch (e) {
        throw new Error(e.error.message);
      }
    }),
  );

  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
};
