module.exports = {
  siteMetadata: {
    // Site URL for when it goes live
    siteUrl: `https://monumental-chimera-b1ace3.netlify.app/`,
    // Your Name
    name: 'Juanjo Requena',
    // Main Site Title
    title: `Juanjo Requena | Software Engineer`,
    // Description that goes under your name in main bio
    description: `Backend Software Engineer`,
    // Optional: Twitter account handle
    author: null,
    // Optional: Github account URL
    github: `https://github.com/wuaho`,
    // Optional: LinkedIn account URL
    linkedin: `https://linkedin.com/in/juanjorequena`,
    //Optional: Hashnode blog URL
    hashnode: `https://blog.juanjorequena.com/`,
    // Content of the About Me section
    about: `Currently a software engineer with 3 years of experience and a focus on backend api development. Used to
fast‑paced environments, when I code I prioritize meeting product requirements first, covering the different
use cases, and then refactor it for a clean and maintainable solution. In general, colleagues know me as a
highly motivated individual who is passionate about creating software solutions with a special concern for
quality and scalability.
`,
    // Optional: List your projects, they must have `name` and `description`. `link` is optional.
    projects: [
      {
        name: 'HiKorea',
        description: `A redesign of South Korea's immigration portal, 
          aiming to create user-friendly flows that help foreigners fulfill their duties with the immigration office.`,
        link: 'https://github.com/wuaho/hikorea-paperman',
      },
    ],
    // Optional: List your experience, they must have `name` and `description`. `link` is optional.
    experience: [
      {
        name: 'Coverwallet, an Aon company',
        position: 'Software Engineer (Sep 2021 - Aug 2024)',
        description:
          'Developed internal tools and backend services for insurance agents to streamline their operations.',
        link: 'https://www.coverwallet.com/',
      },
    ],
    //Optional: List your education
    education: [
      {
        name: 'University of Seville',
        position: '',
        description:
          'Bachelor in Computer Engineering - Information Technologies (2017-2021)',
        link: 'https://www.us.es/',
      },
      {
        name: 'Sogang University - Korean Language Education Center',
        position: '',
        description: 'Korean language course - Level 4 (Sep 2024 - Nov 2024)',
        link: 'https://klec.sogang.ac.kr/?url=/main/index.php&lang=eng',
      },
    ],
    // Optional: List your skills, they must have `name` and `description`.
    skills: [
      {
        name: 'Languages',
        strongSkills: 'TypeScript',
        familiarSkills: 'Java, Ruby, Python',
      },
      {
        name: 'Frameworks',
        description: 'NestJS, Node.js, GraphQL, REST, Ruby on Rails',
      },
      {
        name: 'Technologies',
        description:
          'Amazon Web Services (AWS), Docker, CircleCI, Datadog, Sentry, Git',
      },
      {
        name: 'Databases',
        description: 'PostgreSQL, MongoDB, Redis',
      },
    ],
    volunteering: [
      {
        name: '2024 WPC/AWPC Korea BenchPress & Powerlifting Fall Classic',
        position: 'WPC/AWPC KOREA',
        description:
          'Responsible for running the live streaming for the powerlifting event, managing cameras, and ensuring high‑quality streaming.',
        link: 'https://youtube.com/playlist?list=PLbPLWlYSVHm4NZ6ytCHcy5329x2h_xgot&si=jxfof3ZTrM3fappI',
      },
      {
        name: 'Youth Correspondent',
        position: 'Mairena del Aljarafe Youth Delegation',
        description:
          'I participated as a youth correspondent in the planning and execution of various cultural events, aimed at providing alternative activities for teenagers.',
        link: 'https://www.mairenajoven.com/com/',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect - Associate',
        position: 'Amazon Web Services (AWS)',
        description: 'May 2025',
        link: 'https://aws.amazon.com/es/certification/certified-solutions-architect-associate/',
      },
      {
        name: 'Test of Proficiency in Korean (TOPIK II) - Level 4',
        position:
          "South Korea's National Institute for International Education (NIIED)",
        description: 'November 2023',
        link: 'https://www.topik.go.kr/TWMAIN/TWMAIN0010.do',
      },
      {
        name: 'C1 Advanced (CAE) - Score 195',
        position: 'Cambridge English',
        description: '',
        link: 'https://www.cambridgeenglish.org/es/exams-and-tests/advanced/',
      },
    ],
    languages: [
      {
        name: 'Korean',
        level: 'Intermediate - Advanced',
      },
      {
        name: 'English',
        level: 'Advanced',
      },
      {
        name: 'Spanish',
        level: 'Mothertongue',
      },
    ],
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        include: '/assets/',
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              wrapperStyle: `margin: 0 0 30px;`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`auto`, `webp`],
          placeholder: `dominantColor`,
          quality: 80,
        },
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { frontmatter: { date: DESC } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `ADD YOUR TRACKING ID HERE`, // Optional Google Analytics
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `portfolio`,
        short_name: `portfolio`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`, // This color appears on mobile
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
  ],
};
