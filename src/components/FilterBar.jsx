function FilterBar({ lessons, category, level, onCategoryChange, onLevelChange }) {
  const categories = [...new Set(lessons.map((lesson) => lesson.category).filter(Boolean))].sort();
  const levels = [...new Set(lessons.map((lesson) => String(lesson.level)).filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  return (
    <div className="filter-bar">
      <label>
        <span>Category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Level</span>
        <select value={level} onChange={(event) => onLevelChange(event.target.value)}>
          <option value="all">All levels</option>
          {levels.map((item) => <option key={item} value={item}>Level {item}</option>)}
        </select>
      </label>
    </div>
  );
}

export default FilterBar;
