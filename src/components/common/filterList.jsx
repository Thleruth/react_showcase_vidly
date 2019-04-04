import React from "react";

const FilterList = props => {
  const { items, textProperty, valueProperty, selectedItem, onClick } = props;
  return (
    <ul className="list-group">
      {items.map(item => (
        <li
          key={item[valueProperty]}
          className={
            item[textProperty] === selectedItem[textProperty]
              ? "list-group-item active"
              : "list-group-item"
          }
          onClick={() => onClick(item)}
        >
          {item[textProperty]}
        </li>
      ))}
    </ul>
  );
};

FilterList.defaultProps = {
  textProperty: "name",
  valueProperty: "_id"
};

export default FilterList;
