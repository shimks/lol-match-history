import React, { FormEvent, ChangeEvent, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { MatchInfo } from './setupServer';

const App = () => {
  const [name, setName] = useState('');
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(false);

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
      {matches.length > 0 && matches.map(match => {})}
    </>
  );
};

export default App;
