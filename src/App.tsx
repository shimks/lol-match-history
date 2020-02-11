import React, { FormEvent, ChangeEvent, useState, useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import { MatchInfo } from './setupServer';

const App = () => {
  const [name, setName] = useState('');
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameModeMap, setGameModeMap] = useState<any>([]);
  const [championPicMap, setChampionPicMap] = useState<any>({});
  const [skillMap, setSkillMap] = useState<any>([]);

  useEffect(() => {
    const grabMaps = async () => {
      if (Object.keys(gameModeMap).length === 0) {
        const gameMode = await fetch('/queues.json');
        setGameModeMap(await gameMode.json());
      }

      if (Object.keys(championPicMap).length === 0) {
        const champ = await fetch('/10.3.1/data/en_US/champion.json');
        setChampionPicMap(await champ.json());
      }

      if (Object.keys(skillMap).length === 0) {
        const skills = await fetch('/10.3.1/data/en_US/summoner.json');
        setSkillMap(await skills.json());
      }
    };
    grabMaps();
  }, [championPicMap, gameModeMap, matches, skillMap]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    const res = await fetch(`/search?summoner=${name}`);
    setLoading(false);

    setMatches(await res.json());
  };

  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <>
      <h2>League Stats</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
        />
        <button>Enter</button>
      </form>
      {matches.length > 0 &&
        matches.map(match => {
          return (
            <div>
              <div>
                {gameModeMap &&
                  gameModeMap.find((gameMode: { queueId: number }) => {
                    return gameMode.queueId === match.queueId;
                  }).description}
                {Math.floor(
                  (Date.now() - match.gameCreation!) / (1000 * 3600 * 24),
                )}{' '}
                days ago
                {match.win ? 'Victory' : 'Defeat'}
                {Math.floor(match.gameDuration! / (1000 * 60)) +
                  'm ' +
                  Math.floor((match.gameDuration! / 1000) % 60) +
                  's'}
              </div>
              <div>
                {championPicMap.data &&
                  Object.values(championPicMap.data as object).find(
                    champion => {
                      return champion.key === match.championId!.toString();
                    },
                  ).id}
                {skillMap.data && (
                  <>
                    <img
                      src={`/10.3.1/img/spell/${
                        Object.values(skillMap.data as object).find(skill => {
                          return skill.key === match.spell1Id!.toString();
                        }).image.full
                      }`}
                      alt=""
                    />
                    <img
                      src={`/10.3.1/img/spell/${
                        Object.values(skillMap.data as object).find(skill => {
                          return skill.key === match.spell2Id!.toString();
                        }).image.full
                      }`}
                      alt=""
                    />
                  </>
                )}
                {match.perk0}
                {match.perkSubStyle}
                {match.kills + ' / ' + match.deaths + ' / ' + match.assists}
                {Math.round(
                  ((match.kills! + match.assists!) / (match.deaths! || 1)) *
                    100,
                ) /
                  100 +
                  ':1 KDA'}
              </div>
              <div>
                {'Level' + match.champLevel!}
                {`${match.totalMinionsKilled!} (${Math.round(
                  (match.totalMinionsKilled! / 60) * 10,
                ) / 10}) CS`}
              </div>
            </div>
          );
        })}
    </>
  );
};

export default App;
