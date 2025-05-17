import React from 'react';
import Spain from '/assets/spain.svg';

const classes = {
  wrapper: 'mb-6 flex',
  name: 'font-semibold w-20 text-left mr-6 text-gray-900 pb-1',
  description: 'text-md text-gray-600 font-regular',
};

const LanguageItem = ({ name, level }) => {
  return (
    <div className={classes.wrapper}>
      <h3 className={`${classes.name}`}>{name}</h3>
      {level && <p className={classes.description}>{level}</p>}
    </div>
  );
};

export default LanguageItem;
