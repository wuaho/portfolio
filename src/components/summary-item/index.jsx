import { Link } from 'gatsby';
import React from 'react';

const classes = {
  wrapper: 'mb-6',
  name: 'font-semibold text-gray-900 pb-1',
  description: 'text-md text-gray-600 font-regular',
  skills: 'text-md text-gray-600 font-regular',
};

const SummaryItem = ({
  name,
  description,
  link = false,
  position,
  strongSkills,
  familiarSkills,
  internal = false,
}) => {
  let linkContent;
  if (internal) {
    linkContent = <Link to={link}>{name}</Link>;
  } else {
    linkContent = (
      <a
        href={link}
        target="_blank"
        title={`Go to ${name}`}
        aria-label={`${name}`}
      >
        {name}
      </a>
    );
  }

  return (
    <div className={classes.wrapper}>
      <h3
        className={`${classes.name} ${
          link ? 'hover:underline hover:text-black' : ''
        }`}
      >
        {link ? linkContent : name}
      </h3>
      {position && <p className={classes.description}>{position}</p>}
      {description && <p className={classes.description}>{description}</p>}
      {strongSkills && familiarSkills && (
        <p className={classes.skills}>
          <b>Strong: </b>
          {strongSkills}
          <b> Familiar: </b>
          {familiarSkills}
        </p>
      )}
    </div>
  );
};

export default SummaryItem;
