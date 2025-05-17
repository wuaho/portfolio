exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type SiteSiteMetadata {
      siteUrl: String
      name: String
      title: String
      description: String
      author: String
      github: String
      linkedin: String
      hashnode: String
      about: String
      projects: [SectionItem]
      experience: [ExperienceItem]
      education:  [EducationItem]
      skills: [SkillsItem]
      volunteering:[SectionItem]
      certifications:[SectionItem]
      languages: [LanguageItem]
    }

    type SectionItem {
      name: String!
      position: String
      description: String!
      link: String!
    }

    type EducationItem {
      name: String!
      position: String
      description: String
      link: String
    }

    type ExperienceItem{
      name: String!
      position: String
      description: String
      link: String
    }

    type SkillsItem{
      name: String!
      description: String
      strongSkills: String
      familiarSkills: String
      link: String!
    }

    type LanguageItem{
      name: String!
      level: String!
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }
    
    type Fields {
      slug: String
    }
  `;
  createTypes(typeDefs);
};
