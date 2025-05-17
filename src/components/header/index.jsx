import { Link } from 'gatsby';
import get from 'lodash/get';
import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import Github from '/assets/github.svg';
import Linkedin from '/assets/linkedin.svg';
import Hashnode from '/assets/hashnode.svg';

const classes = {
  wrapper: 'block mb-6 md:flex md:items-center',
  imageWrapper: 'w-full max-w-150',
  image: 'rounded-xl transform transition-all duration-150 hover:scale-105',
  contentWrapper: 'flex-none pt-6 md:pt-1 md:flex-1 md:pl-20',
  name: 'mb-2 text-5xl text-gray-900 font-bold leading-tight hover:text-black',
  description: 'mb-2 text-2xl text-gray-600',
  item: 'inline list-none pr-4',
  link: 'inline-block py-2 font-semibold text-xs text-gray-600 hover:text-black',
  socialButton:
    'size-10 xs:size-12 flex items-center hover:scale-125 transition-transform',
};

const Header = ({ metadata = {} }) => {
  const github = get(metadata, 'github', false);
  const linkedin = get(metadata, 'linkedin', false);
  const hashnode = get(metadata, 'hashnode', false);

  return (
    <div className={classes.wrapper}>
      <div className={classes.imageWrapper}>
        <StaticImage
          className={classes.image}
          src="../../images/micaragrande.jpg"
          alt={metadata.name}
          placeholder="dominantColor"
          layout="fullWidth"
        />
      </div>

      <div className={classes.contentWrapper}>
        <h1 className={classes.name}>{metadata.name}</h1>
        <h2 className={classes.description}>{metadata.description}</h2>

        <section class="flex gap-2 ml-px">
          {linkedin && (
            <a
              className={`${classes.socialButton} animate-slide-up-fade animate-delay-200`}
              href={linkedin}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              title="Go to Juanjo's LinkedIn"
            >
              <Linkedin width="28" height="28" />
            </a>
          )}
          {github && (
            <a
              className={`${classes.socialButton} animate-slide-up-fade animate-delay-100`}
              href={github}
              target="_blank"
              aria-label="GitHub"
              title="Go to Juanjo's GitHub"
            >
              <Github width="28" height="28" />
            </a>
          )}

          {hashnode && (
            <a
              className={`${classes.socialButton} animate-slide-up-fade animate-delay-300`}
              href={hashnode}
              target="_blank"
              aria-label="Hashnode"
              title="Go to Juanjo's Hashnode blog"
            >
              <Hashnode width="28" height="28" />
            </a>
          )}
        </section>
      </div>
    </div>
  );
};

export default Header;
