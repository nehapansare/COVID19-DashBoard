function Dropdown({ countries, selected, setSelected }) {
    return (
      <select
        className="p-2 rounded border"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {countries.map((c, i) => (
          <option key={i} value={c.name.toLowerCase()}>
            {c.name}
          </option>
        ))}
      </select>
    );
  }
  
  export default Dropdown;
  