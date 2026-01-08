import { db } from "./client";
import { targets } from "./schema";

const samplePeople = [
  {
    slug: "mahatma-gandhi",
    name: "Mahatma Gandhi",
    targetType: "person" as const,
    shortDescription: "Leader of Indian independence movement through nonviolent civil disobedience",
    longDescription: "Mohandas Karamchand Gandhi was an Indian lawyer, anti-colonial nationalist, and political ethicist who employed nonviolent resistance to lead the successful campaign for India's independence from British Rule.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Mahatma_Gandhi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg",
    metadata: {
      birthDate: "1869-10-02",
      deathDate: "1948-01-30",
      nationality: "Indian",
      occupation: ["Lawyer", "Activist", "Politician"],
    },
  },
  {
    slug: "albert-einstein",
    name: "Albert Einstein",
    targetType: "person" as const,
    shortDescription: "Theoretical physicist who developed the theory of relativity",
    longDescription: "Albert Einstein was a German-born theoretical physicist, widely held to be one of the greatest and most influential scientists of all time. He developed the theory of relativity, one of the two pillars of modern physics.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Albert_Einstein",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
    metadata: {
      birthDate: "1879-03-14",
      deathDate: "1955-04-18",
      nationality: "German-American",
      occupation: ["Physicist", "Professor"],
    },
  },
  {
    slug: "napoleon-bonaparte",
    name: "Napoleon Bonaparte",
    targetType: "person" as const,
    shortDescription: "French military leader and emperor who conquered much of Europe",
    longDescription: "Napoleon Bonaparte was a French military commander and political leader who rose to prominence during the French Revolution and led successful campaigns during the Revolutionary Wars. He was Emperor of the French from 1804 to 1814.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Napoleon",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg",
    metadata: {
      birthDate: "1769-08-15",
      deathDate: "1821-05-05",
      nationality: "French",
      occupation: ["Military Commander", "Emperor"],
    },
  },
  {
    slug: "nelson-mandela",
    name: "Nelson Mandela",
    targetType: "person" as const,
    shortDescription: "South African anti-apartheid revolutionary and first Black president",
    longDescription: "Nelson Rolihlahla Mandela was a South African anti-apartheid revolutionary and political leader who served as President of South Africa from 1994 to 1999. He was the country's first Black head of state.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/Nelson_Mandela_1994.jpg",
    metadata: {
      birthDate: "1918-07-18",
      deathDate: "2013-12-05",
      nationality: "South African",
      occupation: ["Activist", "Politician", "President"],
    },
  },
  {
    slug: "martin-luther-king-jr",
    name: "Martin Luther King Jr.",
    targetType: "person" as const,
    shortDescription: "American civil rights leader and advocate for nonviolent activism",
    longDescription: "Martin Luther King Jr. was an American Baptist minister and activist who became the most visible spokesman and leader in the American civil rights movement from 1955 until his assassination in 1968.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/Martin_Luther_King%2C_Jr..jpg",
    metadata: {
      birthDate: "1929-01-15",
      deathDate: "1968-04-04",
      nationality: "American",
      occupation: ["Minister", "Activist"],
    },
  },
  {
    slug: "winston-churchill",
    name: "Winston Churchill",
    targetType: "person" as const,
    shortDescription: "British Prime Minister who led the UK during World War II",
    longDescription: "Sir Winston Leonard Spencer Churchill was a British statesman who served as Prime Minister of the United Kingdom from 1940 to 1945, during the Second World War, and again from 1951 to 1955.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Winston_Churchill",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Sir_Winston_Churchill_-_19086236948.jpg",
    metadata: {
      birthDate: "1874-11-30",
      deathDate: "1965-01-24",
      nationality: "British",
      occupation: ["Politician", "Prime Minister", "Writer"],
    },
  },
];

const sampleCountries = [
  {
    slug: "united-states",
    name: "United States of America",
    targetType: "country" as const,
    shortDescription: "Federal republic in North America, world's largest economy",
    longDescription: "The United States of America is a country primarily located in North America. It is a federation of 50 states. The U.S. is the world's third-largest country by both land and total area.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/United_States",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    metadata: {
      region: "North America",
    },
  },
  {
    slug: "china",
    name: "People's Republic of China",
    targetType: "country" as const,
    shortDescription: "Most populous country and second-largest economy",
    longDescription: "China, officially the People's Republic of China, is a country in East Asia. It is the world's most populous country, with a population exceeding 1.4 billion.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/China",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg",
    metadata: {
      region: "East Asia",
    },
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    targetType: "country" as const,
    shortDescription: "Island nation in northwestern Europe with rich imperial history",
    longDescription: "The United Kingdom of Great Britain and Northern Ireland, commonly known as the United Kingdom or Britain, is a country in Europe, off the northwestern coast of the continental mainland.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/United_Kingdom",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg",
    metadata: {
      region: "Europe",
    },
  },
  {
    slug: "india",
    name: "India",
    targetType: "country" as const,
    shortDescription: "South Asian country with the world's largest democracy",
    longDescription: "India, officially the Republic of India, is a country in South Asia. It is the seventh-largest country by area, the second-most populous country, and the most populous democracy in the world.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/India",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
    metadata: {
      region: "South Asia",
    },
  },
];

const sampleIdeas = [
  {
    slug: "democracy",
    name: "Democracy",
    targetType: "idea" as const,
    shortDescription: "System of government where citizens exercise power through voting",
    longDescription: "Democracy is a form of government in which the people have the authority to deliberate and decide legislation, or to choose governing officials to do so. It is derived from the Greek word meaning 'rule by the people'.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Democracy",
    imageUrl: null,
    metadata: {
      ideologyType: "Political System",
      aliases: ["Democratic Government", "Popular Sovereignty"],
    },
  },
  {
    slug: "capitalism",
    name: "Capitalism",
    targetType: "idea" as const,
    shortDescription: "Economic system based on private ownership and free markets",
    longDescription: "Capitalism is an economic system based on the private ownership of the means of production and their operation for profit. Central characteristics include capital accumulation, competitive markets, and a price system.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Capitalism",
    imageUrl: null,
    metadata: {
      ideologyType: "Economic System",
      aliases: ["Free Market Economy", "Market Economy"],
    },
  },
  {
    slug: "socialism",
    name: "Socialism",
    targetType: "idea" as const,
    shortDescription: "Economic system based on collective ownership of production",
    longDescription: "Socialism is a political and economic theory of social organization which advocates that the means of production, distribution, and exchange should be owned or regulated by the community as a whole.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Socialism",
    imageUrl: null,
    metadata: {
      ideologyType: "Economic System",
      aliases: ["Collectivism", "Social Ownership"],
    },
  },
  {
    slug: "environmentalism",
    name: "Environmentalism",
    targetType: "idea" as const,
    shortDescription: "Movement focused on protecting the natural environment",
    longDescription: "Environmentalism is a broad philosophy, ideology, and social movement regarding concerns for environmental protection and improvement of the health of the environment, particularly as the measure for this health seeks to incorporate the impact of changes to the environment on humans, animals, plants and non-living matter.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Environmentalism",
    imageUrl: null,
    metadata: {
      ideologyType: "Social Movement",
      aliases: ["Green Movement", "Environmental Protection"],
    },
  },
];

async function seed() {
  console.log("Seeding database...");

  try {
    // Insert people
    console.log("Inserting people...");
    for (const person of samplePeople) {
      await db.insert(targets).values(person).onConflictDoNothing();
    }
    console.log(`Inserted ${samplePeople.length} people`);

    // Insert countries
    console.log("Inserting countries...");
    for (const country of sampleCountries) {
      await db.insert(targets).values(country).onConflictDoNothing();
    }
    console.log(`Inserted ${sampleCountries.length} countries`);

    // Insert ideas
    console.log("Inserting ideas...");
    for (const idea of sampleIdeas) {
      await db.insert(targets).values(idea).onConflictDoNothing();
    }
    console.log(`Inserted ${sampleIdeas.length} ideas`);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
