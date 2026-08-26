import { Artwork, TeamMember, ServiceItem } from '../types';

export const ARTWORKS: Artwork[] = [
  {
    id: 'monster-ego',
    number: '01',
    title: 'MONSTER EGO CENTRIS',
    subtitle: 'A Sweet and Creative Monster Named Ego Centris',
    category: 'Visual Identity & Character Design',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1To63W9DyOHuh-h5rhOAXdxMlNCh_2uIrBSm_9PserBurWf_eQLcnsw55YLofms3t6b92GfPzCjf0MmKnM-yXb7QQ83qKSYelPajuYuCNNP8TOUZ-YzG7jU3oLBmwY9dfvOZoqveLEaq6wa_fLfMKOrG8KFzQW1DrAsbde4VK2I7t_kdYHi0NJE-T3zGTBN0B1fxrMeOGuNsM4ezC2xSz4pDti1BS7fJ-rfflOPgKM2n0f16DPsp',
    alt: 'A surreal risograph style poster illustration of Ego Centris character reading a book with guitar and floating retro artifacts.',
    accentColor: '#b7102a',
    description: 'An exploration of self-obsession turned into generative energy. Character study combining risograph printing textures with street-art sensibilities and melancholic wonder.',
    tags: ['Risograph', 'Character', 'Print', 'Avant-Garde'],
    deliverables: ['Custom Character Rig', 'Screenprinted Limited Zine', 'AR Poster Layer', 'Apparel Graphics'],
    dimensions: 'A2 420x594mm / 300DPI',
    medium: 'Digital Risograph & Analog Halftone Screen',
    client: 'Self-Initiated SMCRTV Exp'
  },
  {
    id: 'narima',
    number: '02',
    title: 'NARIMA: KEMERDEKAAN',
    subtitle: 'Sebuah short movie oleh Internship SUMUR CREATIVE',
    category: 'Film Direction & Visual Novelty',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4oJp_VRUEuEKOfPDVSq7t7hoI6EdwwNHAJWrc3WdJ4IgW5rIOnw6K7YGhL_wdPmnKFFL7Rum5KhcNM9Gt7Cgi1xIANUMl7HurxgD65R0xlSH9FzvOmeTz7NGIGPzaTeR4t4Zbp5ywpBB_N6IG2bUIU3NnMua7Kryyf9GDEdW6n6U7EcYvy5wuodtznDgcvp8fUaIj-8jg59BOX5aiwyqvWVBWD7oYmjuSUzuOCWVjCohioNIVeka3',
    alt: 'Surreal landscape with purple bird character and blue bear walking towards an eccentric fantasy castle.',
    accentColor: '#006a60',
    description: 'A poetic expedition dissecting what freedom means in hyper-mediated environments. Hand-drawn landscapes fused with brutalist color fields and indie comic pacing.',
    tags: ['Short Film', 'Editorial', 'Narrative', 'Illustration'],
    deliverables: ['Key Art Posters', 'Animation Storyboards', 'Experimental Trailer Title Sequences'],
    dimensions: '500x707mm B2 Lithograph',
    medium: 'Mixed Vector & Gouache Texture',
    client: 'Sumur Creative Intern Labs'
  },
  {
    id: 'lowongan-pekerjaan',
    number: '03',
    title: 'LOWONGAN PEKERJAAN',
    subtitle: 'Buat Yang Mau & Butuh Saja: Graphic, Video, Content',
    category: 'Manifesto & Recruitment Artifact',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb2S9FBnSwg0cseVRQMqJZ2n4gdyWwgouRiU5ZL57n3PEdvFtCGoz_OQEyCUkFiPEW7EclMZYQNXwUeUnwg735CovJz5wMRV2r8iAvC61lomWLR5OQD6kgba112lDwaoYuT5mqAwAmRqrws9vXBNOU3QdEEltFvAACDlrY3rzNiY6ZT4WZcHqDnp_25R6rhRCcCfEdhDqazGpwktUavfJwefFiU8bxw9NKWBQXD6z_h2gzkf-9uja6',
    alt: 'Massive green dinosaur emerging from landscape balancing a tea cup with tiny red rabbit on snout.',
    accentColor: '#8b4c11',
    description: 'Subverting the corporate hiring flyer into a surrealist ritual. Full-time WFO call for designers, video editors, and content strategists ready to break boring templates.',
    tags: ['Recruitment', 'Brutalist Campaign', 'Copywriting', 'Poster'],
    deliverables: ['Social Media Guerrilla Campaign', 'Flyposters for Urban Spaces', 'Candidate Test Suite'],
    dimensions: '600x900mm Wheatpaste',
    medium: 'Cutout Collage & Spray Stencil',
    client: 'Sumur Creative HR Division'
  },
  {
    id: 'mendoakan-lebih-baik',
    number: '04',
    title: 'UNTUK KALI INI: BERDIAM',
    subtitle: 'Mungkin Berdiam dan Mendoakan Lebih Baik Daripada Merayakan',
    category: 'Cultural Commentary & Zine Art',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBskh_2IyNveQlI-xq4hiLlXrv0UQcSkjt7qXz10w4mYcWWVXw2XYcNo0xnvL3vyLQRTA1mprNAk4vk8c_oVsCK_BnmvL_1f8UCM0HivsAOhqOR06fsXar-GTjYlEQi9oZlLkEEa60W3lLX7KZJYH8nE4fq88XMRvv-5PlII42kPuYQs4ECsy4rrVXIN6f657NYZETlOIpiDaP1-iwl2UjaxzwNORiTmwSjQQwk747jSChmg2jTAH5Y0JfoPdH2MBj5Bg',
    alt: 'Surreal collage banner with rabbit, dinosaur and city landscape.',
    accentColor: '#b7102a',
    description: 'Prihatin juga merupakan bentuk perayaan. Upacaranya akan mengibarkan doa tanpa lupa khidmat mengheningkan cipta. Brutalist traffic cone origami on SMR box.',
    tags: ['Commentary', 'Origami', 'Protest Art', 'Vintage Tone'],
    deliverables: ['Folded Broadsheet', 'Limited Woodblock Print', 'Digital Memorial Space'],
    dimensions: 'A1 594x841mm',
    medium: 'Screenprint on Kraft Substrate',
    client: 'SMR Public Artifacts'
  },
  {
    id: 'migrasee',
    number: '05',
    title: 'MIGRASEE',
    subtitle: 'Memindah Sudut Pandang - Mengasah Yang Luput dan Hilang',
    category: 'Sonic Motion & Temporal Art',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-MP7Fal0mGxa_cHWvV3dYimdCVMtHXVbwsewUNtVCiKKPfMRSxxgHDAm0H7Icw2w_qP_u-c1VWMB1C-Q0vdFt-p3FhQXqP2OK7O4pdSoIjpjVZHGcNJOV7NzR2yZBd1bFtgoG1Pj037PSOlKXhr98BtKFeuaX7n2vyx8WADHnWpVFawKFaxnyi1R6JjEwSxYR6QGn3tcv_d9_Gnb14KVfw1ct9F1iWnIm8kaRTQKknVUczFQ7wWLY',
    alt: 'Portrait with clock head and raw paper cutout aesthetic.',
    accentColor: '#db313f',
    description: 'A study on perspective displacement. Splicing soundwaves into physical geometries and challenging linear chronological consumption.',
    tags: ['Motion', 'Sound Design', 'Stop-Motion', 'Visual Metaphor'],
    deliverables: ['Frame-by-frame 2D Animation', 'Custom Soundscape Synthesizer', 'Title Package'],
    dimensions: '1920x1080 24FPS Frame Sequence',
    medium: 'Mixed Stop-Motion & Digital Ink',
    client: 'Migrasee Sound Collective'
  },
  {
    id: 'karjawan',
    number: '06',
    title: 'KARJAWAN: AMANAH TUHAN',
    subtitle: 'Adalah Amanah Dari Tuhan - Redesign By The Sun',
    category: 'Architecture & Folk Brutalism',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdiWc6osESRsqSbIZzDVGmUAtJ0kfpcQ55MeWq8u-wuPAmlzP6TQj3thEdQJIm_ZzNpY1CYZj8cdPQSs-crveOYyEeNwGf4KfdDplyXpFBAenLqQ8TOrYh5-M0aplN8VYGexAuGpXPLE5IgWWtgnuarQLwAqy4mmEItxhCwjfh1fbzWqrK9iCxgzi1wO22LYGlFrB6t6EGLjTpXr94kdkFHxmz4usbTAfd3_Og9SqbRGUBrvE9Dz0l',
    alt: 'Eyeball monitor wire art and surreal shopfront structure.',
    accentColor: '#8b4c11',
    description: 'Seruni roadside kiosk architectural fantasy. Reimagining traditional Indonesian roadside stalls (warung) through brutalist proportions and whimsical deity figures.',
    tags: ['Warung', 'Architectural Fantasy', 'Folk Surrealism', 'Packaging'],
    deliverables: ['Spatial Concept Rendering', 'Storefront Typography System', 'Custom Signage'],
    dimensions: '700x1000mm Archival Giclée',
    medium: 'Digital Pen & Paper Collage',
    client: 'Toko Seruni'
  },
  {
    id: 'honesty',
    number: '07',
    title: 'HONESTY: THE NEW CURRENCY',
    subtitle: 'Semua Mengalir Dari Kejujuran Yang Tak Tertutupi',
    category: 'Brand Philosophy & Packaging',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuneURhf2c3aQfD8BIFNwjVrQO2dVyljZBQvFqXZks63MffDhPchktst1z-1ZbLzr6S9LAT21Nh56gd3tFAJjhNgHGKyE22cqjHzT6LGhzeRsn7TOsh6MrKlsgP6EmAhccu3iUJqYNqvhmU2jVK5hbbcu5rtuFP7aaSsIxQedqh5vvvwiT-eUA7mULcml2FjLf4GUfYuV_Vjsd3yQ9UlBJYhhg6UM8dWlQ7Yo_nFUwgKFTLbgsPR66',
    alt: 'Surreal assemblage of vintage TV, giant rooster bowl, duck and floral elements.',
    accentColor: '#006a60',
    description: 'A monument to absolute creative transparency. Vintage Indonesian rooster noodle bowls paired with rubber ducks, golden letter M totems, and CRT television sets.',
    tags: ['Packaging', 'Typography', 'Folklore', 'Neo-Nostalgia'],
    deliverables: ['Product Label Suite', 'Limited Exhibition Box', 'Ceramic Series Decals'],
    dimensions: '400x600mm Risograph 4-Color',
    medium: 'Risograph Print & Collage',
    client: 'Sumur Studio Experiments'
  },
  {
    id: 'beyond-the-grid',
    number: '08',
    title: 'BEYOND THE GRID: MANIFESTO',
    subtitle: 'Embracing the absurd, the bold, and the unapologetically weird',
    category: 'Studio Monograph',
    year: '2026',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-XDXcMe1YjUFTWYZQJnXD6kWCH5uzuLM30JQXv5Uj8mP0AGOXq0uxWNqL9xcEd3MGTawAZLqtvNALCNa1-_mnIoPIVpDdyo79_zWqMfyJID6WLoDp7hwg8gRWDSK2bJRGlex2ic7-FU-TyaMjeZ3DtRkMdVQwO1zR7MT0d4ccb8BsGpi8HpHTDGWK-5OwY2i1xP-2o7gdpT214DdGvqBSKd6CEksjV6YLvmtHTjG-6gEi4IukkHTn',
    alt: 'Surreal collage with television eye and botanical vines.',
    accentColor: '#b7102a',
    description: 'The definitive creative bible of SUMUR CREATIVE. A declaration of war against boring corporate design, symmetrical minimalism, and soulless modern web patterns.',
    tags: ['Manifesto', 'Editorial', 'Typography', 'Monograph'],
    deliverables: ['160-Page Hardcover Monograph', 'Interactive Web Reader', 'Print Proofs'],
    dimensions: '210x297mm Casebound Book',
    medium: 'Offset Lithography & Foil Stamping',
    client: 'Sumur Creative Press'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'ego-centris',
    name: 'EGO CENTRIS',
    role: 'Creative Director',
    badge: 'VISIONARY ARCHITECT',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLe52eIXcWch8jwnq63C5KJhI3VEdYl-cWSUmJPwVLvNySvlh8AXZdod_lEQgrKN3mxdrJ2gmYVun34epdUQWU6OW1j6rHsRQ2Iw3d9LzJRZ0gdkZhUSnqbMS6_R24KrFUL6T7Aui1FTjucuPE75sjVg0PRf7M_Wst7EBeNrkA0ZDHoHcdMig9M4ucgXWuxVaVOF6YRKtg-nBVDc88mnS-W2euXW56RMYxBr98PRXFhkqtDNg2YzP',
    alt: 'Portrait of Ego Centris with blooming geometric flower head and tailored vintage suit holding a notebook.',
    colorClass: 'text-[#b7102a]',
    bgContainerClass: 'bg-[#fff9ed]',
    colSpan: 'md:col-span-5',
    rowSpan: 'md:row-span-2',
    quote: '"If it looks like a standard template, burn the canvas and start with a brick."',
    bio: 'Founder and Creative Director. Obsessed with brutalist editorial hierarchy, analog print artifacts, and surrealist character design. Directs all campaign concepts from the core ethos of raw sensory disruption.',
    specialties: ['Creative Direction', 'Surrealist Concepting', 'Brutalist Typography', 'Print & Zines'],
    tools: ['Risograph RZ990', 'Gouache on Heavy Cold Press', 'Vector Scalpels', 'Vintage Typewriters']
  },
  {
    id: 'narima',
    name: 'NARIMA',
    role: 'Lead Designer',
    badge: 'SPATIAL MUTINEER',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClJchyTpB6kKal94IjXAfd-pQsvf0mCmuqaZVEgFEC1KuHPrRMParasE8EnMI_GG-9M7KQzCAD4BuRv-VPu-frS3fBe0_l6pUKZ3XrJdpWZGpWn4gVFIb7Ijgo5XUBTCwa2z6iEDqJJHZCZGy4Upwfl7V6gt9NDFGETOGXhmA1MubNX9t8fPheoeeyUZEaXIdlJa5CBjWjGtYMdyRi32TsmNe4I7dhuF9-GXZymeDN1slMdMrpC679',
    alt: 'Surreal portrait of Narima with floating geometric bird head and oversized pencil in a warm studio.',
    colorClass: 'text-[#ffffff]',
    bgContainerClass: 'bg-[#006a60]',
    colSpan: 'md:col-span-7',
    rowSpan: 'md:row-span-1',
    quote: '"We shatter the grid not to destroy order, but to discover wilder symmetries."',
    bio: 'Lead visual designer orchestrating complex spatial layouts, bespoke brand identities, and visceral packaging systems that jump off shelves and screens alike.',
    specialties: ['Brand Identity Systems', 'Spatial Layout', 'Packaging Design', 'Complex Collage Systems'],
    tools: ['Custom Letterpress Blocks', 'Figma Hard Edge Engines', 'Acrylic Halftones', 'Rotary Cutters']
  },
  {
    id: 'karjawan',
    name: 'KARJAWAN',
    role: 'Code Artist',
    badge: 'ANARCHIC ENGINEER',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdiWc6osESRsqSbIZzDVGmUAtJ0kfpcQ55MeWq8u-wuPAmlzP6TQj3thEdQJIm_ZzNpY1CYZj8cdPQSs-crveOYyEeNwGf4KfdDplyXpFBAenLqQ8TOrYh5-M0aplN8VYGexAuGpXPLE5IgWWtgnuarQLwAqy4mmEItxhCwjfh1fbzWqrK9iCxgzi1wO22LYGlFrB6t6EGLjTpXr94kdkFHxmz4usbTAfd3_Og9SqbRGUBrvE9Dz0l',
    alt: 'Karjawan abstract representation: giant eyeball wrapped in wiring on vintage computer terminal.',
    colorClass: 'text-[#ffffff]',
    bgContainerClass: 'bg-[#a96428]',
    colSpan: 'md:col-span-3',
    rowSpan: 'md:row-span-1',
    quote: '"Code is the mortar between chaotic ideas. Make it unbreakably sharp."',
    bio: 'Technologist and creative developer transforming static brutalist artworks into interactive browser experiences, generative algorithms, and responsive canvases.',
    specialties: ['Creative Development', 'WebGL & Canvas Shaders', 'Brutalist UI Engines', 'Generative Typography'],
    tools: ['TypeScript', 'GLSL Shaders', 'Web Audio API', 'Bespoke CSS Compilers']
  },
  {
    id: 'migrasee',
    name: 'MIGRASEE',
    role: 'Motion',
    badge: 'TEMPORAL SPLICER',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-MP7Fal0mGxa_cHWvV3dYimdCVMtHXVbwsewUNtVCiKKPfMRSxxgHDAm0H7Icw2w_qP_u-c1VWMB1C-Q0vdFt-p3FhQXqP2OK7O4pdSoIjpjVZHGcNJOV7NzR2yZBd1bFtgoG1Pj037PSOlKXhr98BtKFeuaX7n2vyx8WADHnWpVFawKFaxnyi1R6JjEwSxYR6QGn3tcv_d9_Gnb14KVfw1ct9F1iWnIm8kaRTQKknVUczFQ7wWLY',
    alt: 'Surreal stop-motion animator portrait with clock head against vibrant red canvas.',
    colorClass: 'text-[#ffffff]',
    bgContainerClass: 'bg-[#b7102a]',
    colSpan: 'md:col-span-4',
    rowSpan: 'md:row-span-1',
    quote: '"Static images are mere sleeping beasts. Motion is their primal scream."',
    bio: 'Motion designer and sound editor specializing in stop-motion analog textures, brutal jump cuts, tactile kinetic typography, and glitch-infused brand teasers.',
    specialties: ['Kinetic Typography', 'Stop-Motion Animation', 'Sound Design & Foley', 'Film Reel Splicing'],
    tools: ['16mm Bolex Camera', 'Analog Oscilloscopes', 'After Effects Rigging', 'Synthesizer Patchbays']
  }
];

export const SERVICES: ServiceItem[] = [
  {
    number: '01',
    tag: 'VISUAL MUTINY',
    title: 'GRAPHIC DESIGN',
    subtitle: 'Breaking Grids & Building Visual Revolutions',
    description: "We don't just push pixels; we shatter grids and rebuild them into compelling, disruptive visual narratives that refuse to be ignored.",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvwTOfoVW4Q7bjO0OTuG3C9YX9sZus2bc_W37vK6nG7Ouf1UbwTGcLgVANXvKNnXFfJiFjatJOrsh0r2VmgWwDllv3jB2Pdv0OfyB4-nlxJWg4Lq194B8GNHP1gE3GEljnI87Eg5lETH8p7K2Op_Xt7gmKdWYKVFHkkkquFLXWwedxGpm4kHq_KqqaFZBtgL6F25TltICWiTqh_mIbuJLCe-6lmFLBvExaJZpc2pSVpVoG5YSwl2Zk',
    imageAlt: 'A surreal collage illustration of an oversized retro TV set in a vast desert landscape.',
    bgContainer: 'bg-[#8cf5e4]',
    accentColor: '#b7102a',
    deliverables: [
      'Visual Identity & Brand Manuals',
      'Editorial Print & Avant-Garde Zines',
      'Bespoke Poster Series & Merch Systems',
      'Tactile Packaging & Unboxing Experiences',
      'Custom Typography & Custom Display Type'
    ],
    manifestoExcerpt: 'Templates are graves for creativity. Every mark we make is intended to stand out like a slap on concrete.'
  },
  {
    number: '02',
    tag: 'TEMPORAL SPLICING',
    title: 'VIDEO EDITING',
    subtitle: 'Splicing Reality Into New Timelines',
    description: 'Splicing reality to create new timelines. Fast cuts, brutal transitions, and analog textures.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqYvhCpTelj6ZTBnUQLaJcU2V3CRPpGAVuCTma9dLm8_zADqThMrtdyY2VcvM_IDhHbKfoPOhHUBk17G8bRIYCIYUFY0cV-OgbiD6ZWNDVnjuCJOyiMZjbnf64xhqh7UqJGpC6rFhcmigGy399p2etKg1iFGF_pB6fdTeKT0xg9LjiJObWSb_RhvYWDbczsaIxpn_KFNcKMM-viLzfjtkx2l7gQHIWuWLOmuB3hNIOCardnv8AlTx0',
    imageAlt: 'Surreal hands manipulating physical film reel over raw concrete.',
    bgContainer: 'bg-[#a96428]',
    accentColor: '#fff9ed',
    deliverables: [
      'Brutal Commercial Cuts & Teasers',
      'Analog Glitch & 16mm Film Treatment',
      'Tactile Kinetic Sound Design',
      'Experimental Music Video Direction',
      'Stop-Motion Storyboards & Loops'
    ],
    manifestoExcerpt: 'Time is malleable. We manipulate rhythm and tension so viewers are glued from frame zero.'
  },
  {
    number: '03',
    tag: 'STRATEGIC CHAOS',
    title: 'CONTENT PLANNING',
    subtitle: 'Orchestrating Cultural Infiltration',
    description: 'Orchestrating the weirdness. We map out campaigns that feel spontaneous but are surgically designed to infiltrate the cultural zeitgeist.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuneURhf2c3aQfD8BIFNwjVrQO2dVyljZBQvFqXZks63MffDhPchktst1z-1ZbLzr6S9LAT21Nh56gd3tFAJjhNgHGKyE22cqjHzT6LGhzeRsn7TOsh6MrKlsgP6EmAhccu3iUJqYNqvhmU2jVK5hbbcu5rtuFP7aaSsIxQedqh5vvvwiT-eUA7mULcml2FjLf4GUfYuV_Vjsd3yQ9UlBJYhhg6UM8dWlQ7Yo_nFUwgKFTLbgsPR66',
    imageAlt: 'Weird surreal collage of anatomical brain emerging from coffee cup with overlapping grid typography.',
    bgContainer: 'bg-[#e8e2d7]',
    accentColor: '#006a60',
    deliverables: [
      'Subversive Content Matrix & Scheduling',
      'Guerrilla Social Takeovers',
      'Interactive Campaign Stunts',
      'Unconventional Copywriting & Voice Guides',
      'Audience Friction & Loyalty Analysis'
    ],
    manifestoExcerpt: 'Never be predictable. Strategy is not a boring spreadsheet; it is weaponized imagination.'
  }
];

export const MANIFESTO_CLAUSES = [
  {
    number: '01',
    title: 'DEFY COMFORTABLE TEMPLATES',
    text: 'Symmetrical pastel cards are designed to be forgotten. We build digital and physical experiences with raw edges, thick inks, and unexpected collisions.'
  },
  {
    number: '02',
    title: 'EMBRACE ANALOG FRICTION',
    text: 'Halftones, risograph bleeds, physical paper grain, and vintage cassette hiss remind us that humans have skin, eyes, and fingers that crave tactile sensation.'
  },
  {
    number: '03',
    title: 'CHAOS WITH SURGICAL DISCIPLINE',
    text: 'Our asymmetry is not an accident; it is mathematical tension calculated to grab optical focus and never let it go.'
  },
  {
    number: '04',
    title: 'HONESTY IS OUR ONLY CURRENCY',
    text: 'No fake marketing fluff. We tell raw truths, celebrate the weird, and build work that endures beyond disposable algorithmic trends.'
  }
];
