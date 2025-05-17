import React from 'react';

import Section from '../section';
import LanguageItem from './language.jsx';

const SectionLanguages = ({ languages }) => {
  if (!languages.length) return null;

  return (
    <Section title="Languages">
      {languages.map((language) => (
        <LanguageItem
          key={language.name}
          name={language.name}
          level={language.level}
        />
      ))}
    </Section>
  );
};

export default SectionLanguages;
