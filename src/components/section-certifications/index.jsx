import React from 'react';

import Section from '../section';
import SummaryItem from '../summary-item';

const SectionCertifications = ({ certifications }) => {
  if (!certifications.length) return null;

  return (
    <Section title="Certifications">
      {certifications.map((certificate) => (
        <SummaryItem
          key={certificate.name}
          name={certificate.name}
          position={certificate.position}
          description={certificate.description}
          link={certificate.link}
        />
      ))}
    </Section>
  );
};

export default SectionCertifications;
