import './App.css';
import { useGetKanjiName } from './hooks/useGetKanjiName';

const App = () => {
  const {
    familyName,
    setFamilyName,
    nameCount,
    setNameCount,
    fullName,
    kanjiNames,
    executeNaming,
  } = useGetKanjiName();

  return (
    <div className="App">
      <div>
        <div className="text-9xl">{fullName}</div>
        <div className="flex justify-center">
          {Array.from(kanjiNames).map((name) => {
            return (
              <div className="p-2" key={name}>
                {familyName} {name}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label htmlFor="family-name-input" className="mr-3 text-blue-300">
          Family Name
        </label>
        <input
          type={'text'}
          id="family-name-input"
          className="rounded-md p-2"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
        />
      </div>
      <div className="my-2 divide-x-2"></div>
      <div>
        <label htmlFor="name-count-input" className="mr-3 text-blue-300">
          Name Count
        </label>
        <input
          type={'number'}
          min={1}
          max={10}
          id="name-count-input"
          className="rounded-md p-2"
          value={nameCount}
          onChange={(e) => setNameCount(Number(e.target.value))}
        />
      </div>
      <button className="mt-5 bg-cyan-700" onClick={() => executeNaming()}>
        Execute
      </button>
    </div>
  );
};

export default App;
