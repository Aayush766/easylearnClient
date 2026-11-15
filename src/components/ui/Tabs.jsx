function Tabs({ activeId, onChange, tabs }) {
  return <div aria-label="Tabs" className="tabs" role="tablist">{tabs.map((tab) => <button aria-selected={activeId === tab.id} className={activeId === tab.id ? "tabs__item tabs__item--active" : "tabs__item"} key={tab.id} onClick={() => onChange(tab.id)} role="tab" type="button">{tab.label}</button>)}</div>;
}

export default Tabs;
