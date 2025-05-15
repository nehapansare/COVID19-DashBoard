function StatCard({ title, value, color }) {
    return (
      <div className={`p-4 rounded text-white ${color}`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl">{value}</p>
      </div>
    );
  }
  
  export default StatCard;
  