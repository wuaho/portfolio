import { graphql } from 'gatsby';
import get from 'lodash/get';
import React from 'react';

import Header from '../components/header';
import Layout from '../components/layout';
import SectionAbout from '../components/section-about';
import SectionExperience from '../components/section-experience';
import SectionProjects from '../components/section-projects';
import SectionSkills from '../components/section-skills';
import SectionEducation from '../components/section-education';
import SectionVolunteering from '../components/section-volunteering';
import SectionCertifications from '../components/section-certifications';
import SectionLanguages from '../components/section-languages';
import SEO from '../components/seo';

const Index = ({ data }) => {
  const about = get(data, 'site.siteMetadata.about', false);
  const projects = get(data, 'site.siteMetadata.projects', false);
  const experience = get(data, 'site.siteMetadata.experience', false);
  const skills = get(data, 'site.siteMetadata.skills', false);
  const education = get(data, 'site.siteMetadata.education', false);
  const volunteering = get(data, 'site.siteMetadata.volunteering', false);
  const certifications = get(data, 'site.siteMetadata.certifications', false);
  const languages = get(data, 'site.siteMetadata.languages', false);

  return (
    <Layout>
      <SEO />
      <Header metadata={data.site.siteMetadata} />
      {about && <SectionAbout about={about} />}
      {experience && experience.length && (
        <SectionExperience experience={experience} />
      )}
      {education && education.length && (
        <SectionEducation education={education} />
      )}
      {projects && projects.length && <SectionProjects projects={projects} />}
      {skills && skills.length && <SectionSkills skills={skills} />}
      {languages && languages.length && (
        <SectionLanguages languages={languages} />
      )}
      {volunteering && volunteering.length && (
        <SectionVolunteering volunteering={volunteering} />
      )}
      {certifications && certifications.length && (
        <SectionCertifications certifications={certifications} />
      )}
    </Layout>
  );
};

export default Index;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        name
        title
        description
        about
        author
        github
        linkedin
        hashnode
        projects {
          name
          description
          link
        }
        experience {
          name
          position
          description
          link
        }
        education {
          name
          position
          description
          link
        }
        skills {
          name
          description
          strongSkills
          familiarSkills
        }
        volunteering {
          name
          position
          description
          link
        }
        certifications {
          name
          position
          description
          link
        }
        languages {
          name
          level
        }
      }
    }
  }
`;
