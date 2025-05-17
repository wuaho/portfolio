import React from 'react';

import Section from '../section';
import SummaryItem from '../summary-item';

const SectionVolunteering = ({ volunteering }) => {
  if (!volunteering.length) return null;

  return (
    <Section title="Volunteering">
      {volunteering.map((item) => (
        <SummaryItem
          key={item.name}
          name={item.name}
          position={item.position}
          description={item.description}
          link={item.link}
        />
      ))}
    </Section>
  );
};

export default SectionVolunteering;
