const AgendaItem = ({ agenda }: { agenda: string[] }) => {
  const items = agenda
    .flatMap((str) => str.split(/,(?=\d)/)) // split each string by comma before a digit
    .map((item) => item.trim());
  return (
    <div className="agenda">
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaItem;
