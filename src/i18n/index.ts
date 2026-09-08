import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang || 'fr',
    resources: {
      fr: {
        translation: {
          nav: {
            home: 'Accueil',
            architecture: 'Architecture',
            digital: 'Digital',
            portfolio: 'Portfolio',
            about: 'À propos',
            contact: 'Contact',
          },
          footer: {
            tagline: 'Concevoir l\'espace. Coder l\'avenir.',
            poles: 'Pôles',
            architecture: 'Architecture',
            digital: 'Digital',
            company: 'Entreprise',
            about: 'À propos',
            portfolio: 'Portfolio',
            legal: 'Mentions légales',
            contact: 'Contact',
            rights: 'Tous droits réservés.',
          },
          contact: {
            title: 'Parlons de votre projet',
            name: 'Nom complet',
            email: 'Email',
            phone: 'Téléphone',
            subject: 'Sujet',
            message: 'Message',
            send: 'Envoyer',
            sent: 'Message envoyé !',
            sentDesc: 'Merci pour votre message. Nous vous répondrons dans les plus brefs délais.',
            sendAnother: 'Envoyer un autre message',
            error: 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.',
            info: 'Coordonnées',
            address: 'Adresse',
            phoneLabel: 'Téléphone',
            emailLabel: 'Email',
            hours: 'Horaires',
          },
          home: {
            hero: {
              line1: 'Concevoir',
              highlight1: "l'espace.",
              line2: 'Coder',
              highlight2: "l'avenir.",
              subtitle: "Design d'espace, aménagement paysager & urbain.\nDéveloppement logiciel et solutions digitales sur mesure.",
            },
            manifesto: {
              label: 'Notre vision',
            },
            poles: {
              architecture: {
                title: 'Architecture',
                desc: "Aménagement paysager & urbain, mobiliers, œuvres d'art.",
              },
              digital: {
                title: 'Digital',
                desc: 'Applications web, plateformes, consulting technique.',
              },
            },
            stats: {
              label: 'Nos chiffres',
              poles: "Pôles d'expertise",
              projects: 'Projets livrés',
              partners: 'Partenaires',
              custom: 'Sur mesure',
            },
            cta: {
              label: 'Contact',
              title: 'Un projet\nen tête ?',
              subtitle: 'Discutons de votre vision et voyons comment nous pouvons la concrétiser ensemble.',
              primary: 'Contactez-nous',
              secondary: 'Voir le portfolio',
            },
          },
          architecture: {
            hero: {
              label: 'Architecture',
              title: "Design d'espace, aménagement & art",
              subtitle: "Nous concevons des espaces qui inspirent, des aménagements qui durent et des œuvres qui parlent.",
            },
            section: {
              label: 'Nos services',
              title: "L'architecture sous\ntoutes ses formes",
            },
            cta: {
              title: "Un projet d'aménagement ?",
              subtitle: 'De la conception à la réalisation, nous vous accompagnons à chaque étape.',
              btn: 'Parlons de votre projet',
            },
          },
          digital: {
            hero: {
              label: 'Digital',
              title: 'Solutions digitales sur mesure',
              subtitle: 'Ingénierie logicielle de qualité, du concept au déploiement.',
            },
            section: {
              label: 'Nos services',
              title: 'Du code qui résout\nde vrais problèmes',
            },
            cta: {
              title: 'Un projet digital ?',
              subtitle: "De l'idée au déploiement, nous transformons vos besoins en solutions concrètes.",
              btn: 'Discutons-en',
            },
          },
          portfolio: {
            hero: {
              label: 'Portfolio',
              title: 'Nos réalisations',
              subtitle: "Chaque projet reflète notre engagement envers l'excellence et l'innovation.",
            },
            filters: {
              all: 'Tous',
              architecture: 'Architecture',
              digital: 'Digital',
            },
            cta: {
              title: 'Un projet en tête ?',
              subtitle: 'Discutons de votre vision et voyons comment nous pouvons la concrétiser.',
              btn: 'Contactez-nous',
            },
          },
          about: {
            hero: {
              label: 'À propos',
              title: 'Deux univers, une vision',
              subtitle: 'Architecture et code, espace physique et digital — tout est question de conception.',
            },
            story: {
              label: 'Notre histoire',
              title: 'La rencontre entre deux mondes qui se complètent.',
            },
            pillars: {
              label: 'Ce que nous faisons',
              architecture: {
                title: 'Architecture & Design',
                subtitle: "De l'espace intérieur au paysage urbain, chaque projet est une sculpture habitable.",
              },
              digital: {
                title: 'Digital & Logiciel',
                subtitle: 'Des systèmes robustes et des interfaces élégantes qui résolvent de vrais problèmes.',
              },
            },
            founders: {
              label: 'Les fondateurs',
              title: 'La vision de Claude,\nrenforcée par Dylan',
            },
            team: {
              label: "L'équipe",
              title: 'Les talents qui font vivre nos projets',
            },
            vision: {
              label: 'Notre vision',
              quote: "Nous ne faisons pas la différence entre construire un espace et coder un système. Dans les deux cas, il s'agit de concevoir quelque chose qui dure, qui sert, et qui — si on fait bien notre travail — donne envie de rester.",
              footer: "Chaque projet chez NOUN CONCEPT porte cette conviction : l'excellence n'est pas un choix, c'est le seul standard acceptable.",
            },
          },
          common: {
            loading: 'Chargement...',
            notFound: 'Page introuvable',
            backHome: "Retour à l'accueil",
            seeAll: 'Voir tout',
            contactUs: 'Contactez-nous',
            viewPortfolio: 'Voir le portfolio',
            scroll: 'Scroll',
            noProjects: 'Aucun projet dans cette catégorie pour le moment.',
            realizations: 'Réalisations',
          },
        },
      },
      en: {
        translation: {
          nav: {
            home: 'Home',
            architecture: 'Architecture',
            digital: 'Digital',
            portfolio: 'Portfolio',
            about: 'About',
            contact: 'Contact',
          },
          footer: {
            tagline: 'Designing space. Coding the future.',
            poles: 'Poles',
            architecture: 'Architecture',
            digital: 'Digital',
            company: 'Company',
            about: 'About',
            portfolio: 'Portfolio',
            legal: 'Legal notice',
            contact: 'Contact',
            rights: 'All rights reserved.',
          },
          contact: {
            title: "Let's talk about your project",
            name: 'Full name',
            email: 'Email',
            phone: 'Phone',
            subject: 'Subject',
            message: 'Message',
            send: 'Send',
            sent: 'Message sent!',
            sentDesc: "Thank you for your message. We'll get back to you shortly.",
            sendAnother: 'Send another message',
            error: 'An error occurred. Please try again or contact us directly by email.',
            info: 'Contact info',
            address: 'Address',
            phoneLabel: 'Phone',
            emailLabel: 'Email',
            hours: 'Working hours',
          },
          home: {
            hero: {
              line1: 'Design',
              highlight1: 'space.',
              line2: 'Code',
              highlight2: 'the future.',
              subtitle: 'Space design, landscape & urban planning.\nCustom software development and digital solutions.',
            },
            manifesto: {
              label: 'Our vision',
            },
            poles: {
              architecture: {
                title: 'Architecture',
                desc: 'Landscape & urban planning, furniture, artworks.',
              },
              digital: {
                title: 'Digital',
                desc: 'Web apps, platforms, technical consulting.',
              },
            },
            stats: {
              label: 'Our numbers',
              poles: 'Areas of expertise',
              projects: 'Projects delivered',
              partners: 'Partners',
              custom: 'Custom-built',
            },
            cta: {
              label: 'Contact',
              title: 'A project\nin mind?',
              subtitle: "Let's discuss your vision and see how we can bring it to life together.",
              primary: 'Contact us',
              secondary: 'View portfolio',
            },
          },
          architecture: {
            hero: {
              label: 'Architecture',
              title: 'Space design, planning & art',
              subtitle: 'We design spaces that inspire, developments that last and works that speak.',
            },
            section: {
              label: 'Our services',
              title: 'Architecture in\nall its forms',
            },
            cta: {
              title: 'A planning project?',
              subtitle: 'From concept to completion, we support you every step of the way.',
              btn: "Let's talk about your project",
            },
          },
          digital: {
            hero: {
              label: 'Digital',
              title: 'Custom digital solutions',
              subtitle: 'Quality software engineering, from concept to deployment.',
            },
            section: {
              label: 'Our services',
              title: 'Code that solves\nreal problems',
            },
            cta: {
              title: 'A digital project?',
              subtitle: 'From idea to deployment, we turn your needs into concrete solutions.',
              btn: "Let's talk",
            },
          },
          portfolio: {
            hero: {
              label: 'Portfolio',
              title: 'Our work',
              subtitle: 'Every project reflects our commitment to excellence and innovation.',
            },
            filters: {
              all: 'All',
              architecture: 'Architecture',
              digital: 'Digital',
            },
            cta: {
              title: 'A project in mind?',
              subtitle: "Let's discuss your vision and see how we can bring it to life.",
              btn: 'Contact us',
            },
          },
          about: {
            hero: {
              label: 'About',
              title: 'Two worlds, one vision',
              subtitle: 'Architecture and code, physical space and digital — it\'s all about design.',
            },
            story: {
              label: 'Our story',
              title: 'Where two worlds come together.',
            },
            pillars: {
              label: 'What we do',
              architecture: {
                title: 'Architecture & Design',
                subtitle: 'From interior to urban landscape, every project is a habitable sculpture.',
              },
              digital: {
                title: 'Digital & Software',
                subtitle: 'Robust systems and elegant interfaces that solve real problems.',
              },
            },
            founders: {
              label: 'The founders',
              title: "Claude's vision,\nreinforced by Dylan",
            },
            team: {
              label: 'The team',
              title: 'The talent behind our projects',
            },
            vision: {
              label: 'Our vision',
              quote: "We make no distinction between building a space and coding a system. In both cases, it's about designing something that lasts, that serves, and that — if we do our job well — makes people want to stay.",
              footer: 'Every project at NOUN CONCEPT carries this conviction: excellence is not a choice, it\'s the only acceptable standard.',
            },
          },
          common: {
            loading: 'Loading...',
            notFound: 'Page not found',
            backHome: 'Back to home',
            seeAll: 'See all',
            contactUs: 'Contact us',
            viewPortfolio: 'View portfolio',
            scroll: 'Scroll',
            noProjects: 'No projects in this category yet.',
            realizations: 'Projects',
          },
        },
      },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
