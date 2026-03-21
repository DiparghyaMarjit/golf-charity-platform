-- Insert Sample Charities for Golf Charity Platform

INSERT INTO charities (id, name, description, logo_url, website_url, is_featured) VALUES
(
  gen_random_uuid(),
  'Make-A-Wish Foundation',
  'Grants wishes to children with critical illnesses. Supporting dreams and creating hope.',
  'https://via.placeholder.com/200?text=Make-A-Wish',
  'https://www.wish.org',
  true
),
(
  gen_random_uuid(),
  'St. Jude Children''s Research Hospital',
  'Leading pediatric cancer research and treatment. Fighting childhood cancer.',
  'https://via.placeholder.com/200?text=St+Jude',
  'https://www.stjude.org',
  true
),
(
  gen_random_uuid(),
  'Doctors Without Borders',
  'International medical humanitarian organization providing aid in conflict zones.',
  'https://via.placeholder.com/200?text=MSF',
  'https://www.msf.org',
  false
),
(
  gen_random_uuid(),
  'The Red Cross',
  'Humanitarian organization helping vulnerable people affected by disasters.',
  'https://via.placeholder.com/200?text=Red+Cross',
  'https://www.redcross.org',
  true
),
(
  gen_random_uuid(),
  'World Wildlife Fund',
  'Conservation organization protecting endangered species and natural habitats.',
  'https://via.placeholder.com/200?text=WWF',
  'https://www.worldwildlife.org',
  false
),
(
  gen_random_uuid(),
  'UNICEF',
  'Supporting children in developing countries with education, health, and nutrition.',
  'https://via.placeholder.com/200?text=UNICEF',
  'https://www.unicefusa.org',
  true
),
(
  gen_random_uuid(),
  'American Cancer Society',
  'Funding cancer research and supporting cancer patients and survivors.',
  'https://via.placeholder.com/200?text=Cancer+Society',
  'https://www.cancer.org',
  false
),
(
  gen_random_uuid(),
  'Helen Keller International',
  'Combating poverty, preventable blindness, and malnutrition worldwide.',
  'https://via.placeholder.com/200?text=HKI',
  'https://www.hki.org',
  false
);
