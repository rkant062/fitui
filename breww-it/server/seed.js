const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Blog = require('./models/Blog');

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Cluster90017:root@cluster90017.hqe5auc.mongodb.net/breww-it?retryWrites=true&w=majority&appName=Cluster90017';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Demo Users
const demoUsers = [
  {
    firstName: 'John',
    lastName: 'TechWriter',
    username: 'johntech',
    email: 'john@demo.com',
    password: 'password123',
    role: 'author',
    bio: 'Tech enthusiast and software developer with 10+ years of experience.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    firstName: 'Sarah',
    lastName: 'TravelBlogger',
    username: 'sarahtravel',
    email: 'sarah@demo.com',
    password: 'password123',
    role: 'author',
    bio: 'Adventure seeker and travel photographer. Exploring the world one destination at a time.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    firstName: 'Mike',
    lastName: 'TriviaMaster',
    username: 'miketrivia',
    email: 'mike@demo.com',
    password: 'password123',
    role: 'author',
    bio: 'History buff and trivia enthusiast. Sharing fascinating facts and stories.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    bio: 'System administrator and content moderator.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
];

// Demo Blog Posts
const demoBlogs = [
  {
    title: 'The Future of Artificial Intelligence in 2024',
    content: `Artificial Intelligence has evolved dramatically over the past decade, and 2024 marks a significant turning point in how we interact with AI technologies. From large language models to autonomous vehicles, AI is reshaping industries across the board.

One of the most exciting developments this year is the advancement of generative AI. Tools like ChatGPT, Claude, and others have demonstrated remarkable capabilities in understanding and generating human-like text. These models are not just improving in their conversational abilities but are also becoming more specialized for specific domains.

In healthcare, AI is revolutionizing diagnosis and treatment planning. Machine learning algorithms can now analyze medical images with accuracy that rivals or exceeds human radiologists. This technology is particularly valuable in early detection of diseases like cancer, where early intervention can save lives.

The automotive industry is another sector experiencing rapid AI integration. Self-driving technology continues to advance, with companies like Tesla, Waymo, and others making significant strides in autonomous vehicle development. While fully autonomous cars aren't yet mainstream, the technology is getting closer to widespread adoption.

However, with these advancements come important considerations about ethics, privacy, and job displacement. As AI becomes more sophisticated, we need to ensure that these technologies are developed and deployed responsibly. This includes addressing biases in AI systems, protecting user privacy, and managing the transition of jobs that may be automated.

Looking ahead, we can expect AI to become even more integrated into our daily lives. From smart homes to personalized education, AI will continue to transform how we live and work. The key is to embrace these changes while ensuring that AI serves humanity's best interests.`,
    excerpt: 'Exploring the latest developments in AI technology and their impact on various industries.',
    category: 'tech',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    tags: ['AI', 'Technology', 'Machine Learning', 'Future'],
    isFeatured: true,
    status: 'published',
    views: 1250,
    metaTitle: 'The Future of AI in 2024 - Tech Insights',
    metaDescription: 'Discover the latest developments in artificial intelligence and how they\'re shaping our future.'
  },
  {
    title: 'Hidden Gems: Exploring the Lesser-Known Islands of Greece',
    content: `While Santorini and Mykonos often steal the spotlight, Greece is home to countless lesser-known islands that offer authentic experiences away from the tourist crowds. These hidden gems provide a glimpse into traditional Greek life and untouched natural beauty.

One such treasure is the island of Milos, known for its stunning beaches and lunar-like landscapes. The island's unique geology has created some of the most beautiful beaches in the Mediterranean, including the famous Sarakiniko Beach with its white volcanic rocks. Unlike the more popular islands, Milos maintains a relaxed atmosphere perfect for those seeking tranquility.

Another hidden paradise is Folegandros, a small island that has managed to preserve its authentic character. The island's main village, Chora, is built on the edge of a 200-meter cliff, offering breathtaking views of the Aegean Sea. The narrow, winding streets and traditional white-washed houses create a picture-perfect setting that feels frozen in time.

For nature lovers, the island of Alonissos in the Sporades archipelago offers pristine beaches and crystal-clear waters. The island is part of a marine park, making it an ideal destination for snorkeling and diving enthusiasts. The underwater world here is teeming with marine life, including the endangered Mediterranean monk seal.

The island of Symi, located near Rhodes, is another hidden gem worth exploring. Known for its colorful neoclassical architecture and peaceful atmosphere, Symi offers a perfect escape from the hustle and bustle of more touristy destinations. The island's harbor is particularly picturesque, with pastel-colored buildings lining the waterfront.

These lesser-known islands not only offer authentic Greek experiences but also help support local communities that rely on sustainable tourism. By choosing these destinations, travelers can contribute to the preservation of traditional Greek culture while enjoying unique and memorable experiences.`,
    excerpt: 'Discover the authentic beauty of Greece\'s lesser-known islands away from the tourist crowds.',
    category: 'travel',
    featuredImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=400&fit=crop',
    tags: ['Greece', 'Islands', 'Travel', 'Hidden Gems', 'Mediterranean'],
    isFeatured: true,
    status: 'published',
    views: 890,
    metaTitle: 'Hidden Greek Islands - Travel Guide',
    metaDescription: 'Explore the lesser-known islands of Greece for authentic experiences away from tourist crowds.'
  },
  {
    title: 'The Fascinating History of Coffee: From Ethiopian Goats to Global Phenomenon',
    content: `Coffee, one of the world's most beloved beverages, has a history as rich and complex as its flavor. The story begins in the highlands of Ethiopia, where legend has it that a goat herder named Kaldi discovered the energizing effects of coffee beans after noticing his goats becoming unusually lively after eating berries from a certain tree.

The discovery of coffee's stimulating properties led to its cultivation and spread throughout the Arabian Peninsula. By the 15th century, coffee had become an integral part of Islamic culture, with the first coffee houses, known as qahveh khaneh, appearing in Mecca. These establishments quickly became centers of social activity, intellectual discussion, and political debate.

The Ottoman Empire played a crucial role in coffee's global spread. Turkish coffee, prepared by boiling finely ground coffee beans with water and often flavored with cardamom, became a cultural institution. The elaborate coffee ceremonies and the art of coffee reading (tasseography) developed during this period.

Coffee's journey to Europe began in the 17th century, with the first coffee house opening in Venice in 1647. These establishments, known as "penny universities" in England, became gathering places for artists, writers, and intellectuals. The famous Lloyd's of London insurance company began as a coffee house frequented by merchants and ship captains.

The Dutch were instrumental in spreading coffee cultivation globally. They established coffee plantations in their colonies, including Java (Indonesia), which is why "java" became a nickname for coffee. The French later introduced coffee to the Caribbean and South America, where it flourished in the tropical climate.

Today, coffee is the second most traded commodity in the world after oil, with over 2.25 billion cups consumed daily. The industry supports millions of farmers worldwide and has given rise to a sophisticated coffee culture that celebrates everything from single-origin beans to elaborate brewing methods.

The story of coffee is not just about a beverage but about human connection, cultural exchange, and the global economy. From its humble beginnings in Ethiopia to its current status as a global phenomenon, coffee continues to bring people together across cultures and continents.`,
    excerpt: 'Discover the incredible journey of coffee from Ethiopian discovery to global phenomenon.',
    category: 'trivia',
    featuredImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop',
    tags: ['Coffee', 'History', 'Culture', 'Global Trade', 'Beverages'],
    isFeatured: true,
    status: 'published',
    views: 1560,
    metaTitle: 'Coffee History - From Ethiopia to Global Phenomenon',
    metaDescription: 'Explore the fascinating history of coffee from its discovery in Ethiopia to becoming a global beverage.'
  },
  {
    title: 'Sustainable Travel: How to Explore the World Responsibly',
    content: `As awareness of environmental issues grows, sustainable travel has become more than just a trend—it's a necessity. Traveling responsibly means minimizing our environmental impact while supporting local communities and preserving cultural heritage.

One of the most effective ways to travel sustainably is to choose eco-friendly accommodations. Look for hotels and resorts that have implemented green practices such as solar power, water conservation, and waste reduction. Many properties now offer carbon-neutral stays and use locally sourced materials and food.

Transportation choices also play a crucial role in sustainable travel. Opting for trains over planes for shorter distances can significantly reduce your carbon footprint. When flying is necessary, consider purchasing carbon offsets to mitigate the environmental impact. Once at your destination, use public transportation, walk, or rent bicycles instead of relying on private cars.

Supporting local economies is another important aspect of sustainable travel. Choose locally owned restaurants, shops, and tour operators over international chains. This not only provides authentic experiences but also ensures that your money benefits the local community directly.

Respect for local cultures and traditions is fundamental to sustainable travel. Take time to learn about local customs and dress codes before visiting. Always ask permission before taking photos of people, and be mindful of sacred sites and cultural practices.

Reducing waste while traveling is easier than you might think. Bring a reusable water bottle, shopping bag, and utensils. Avoid single-use plastics and choose products with minimal packaging. Many destinations now have water refill stations, making it easy to stay hydrated without contributing to plastic waste.

Wildlife tourism requires special consideration. Avoid attractions that exploit animals for entertainment, such as elephant rides or tiger selfies. Instead, support sanctuaries and conservation projects that prioritize animal welfare and habitat protection.

Sustainable travel isn't about sacrificing comfort or experiences—it's about making conscious choices that benefit both travelers and destinations. By adopting these practices, we can help ensure that the places we love remain beautiful and accessible for future generations.`,
    excerpt: 'Learn how to travel responsibly while minimizing environmental impact and supporting local communities.',
    category: 'travel',
    featuredImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop',
    tags: ['Sustainable Travel', 'Eco-friendly', 'Responsible Tourism', 'Environment'],
    isFeatured: false,
    status: 'published',
    views: 720,
    metaTitle: 'Sustainable Travel Guide - Responsible Tourism',
    metaDescription: 'Learn how to travel responsibly while minimizing environmental impact and supporting local communities.'
  },
  {
    title: 'The Rise of Remote Work: How Technology is Reshaping the Workplace',
    content: `The COVID-19 pandemic accelerated a workplace transformation that was already underway: the shift toward remote work. What began as a necessary response to health concerns has evolved into a fundamental change in how we think about work, productivity, and work-life balance.

Technology has been the driving force behind this transformation. Video conferencing platforms like Zoom, Microsoft Teams, and Google Meet have made face-to-face communication possible across continents. Cloud-based collaboration tools such as Slack, Notion, and Asana have enabled teams to work together seamlessly regardless of physical location.

The benefits of remote work extend beyond convenience. Studies have shown that remote workers often report higher job satisfaction and productivity. The elimination of commute times has given people more time for family, hobbies, and personal development. Companies have also benefited from reduced overhead costs and access to a global talent pool.

However, remote work also presents challenges that need to be addressed. The blurring of boundaries between work and personal life can lead to burnout. Companies must develop new strategies for team building, mentorship, and maintaining company culture in a virtual environment.

The hybrid work model, which combines remote and in-office work, has emerged as a popular solution. This approach offers the flexibility of remote work while maintaining the benefits of in-person collaboration. Many companies are redesigning their office spaces to accommodate this new way of working.

As we look to the future, it's clear that remote work is here to stay. The challenge for organizations is to create policies and practices that maximize the benefits while addressing the challenges. This includes investing in technology infrastructure, developing clear communication protocols, and fostering a culture of trust and accountability.

The workplace of the future will likely be more flexible, technology-driven, and focused on results rather than time spent in an office. This shift represents not just a change in where we work, but in how we think about work itself.`,
    excerpt: 'Explore how technology is transforming the workplace and enabling the rise of remote work.',
    category: 'tech',
    featuredImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
    tags: ['Remote Work', 'Technology', 'Workplace', 'Digital Transformation'],
    isFeatured: false,
    status: 'published',
    views: 980,
    metaTitle: 'Remote Work Revolution - Technology Transforming Workplace',
    metaDescription: 'Discover how technology is reshaping the workplace and enabling the rise of remote work.'
  },
  {
    title: 'Ancient Civilizations: The Lost City of Petra',
    content: `Hidden in the rugged desert canyons of southern Jordan lies one of the world's most remarkable archaeological sites: the ancient city of Petra. Carved directly into the red sandstone cliffs, this UNESCO World Heritage site represents the pinnacle of Nabataean engineering and artistry.

The Nabataeans, a nomadic Arab people, established Petra as their capital around the 4th century BCE. What makes Petra extraordinary is not just its age, but the sophisticated engineering and artistic achievements of its builders. The entire city was carved from the living rock, creating a seamless integration between architecture and natural landscape.

The most iconic structure in Petra is the Treasury (Al-Khazneh), a magnificent temple facade carved into a cliff face. Standing 40 meters tall, the Treasury features elaborate Corinthian columns, friezes, and sculptures that demonstrate the Nabataeans' mastery of Hellenistic architectural styles. The building's purpose remains a mystery, though it was likely a royal tomb or temple.

Beyond the Treasury, Petra contains hundreds of other structures, including temples, tombs, theaters, and residential areas. The city's water management system is particularly impressive, with an extensive network of channels, cisterns, and dams that collected and distributed water throughout the arid landscape.

The Nabataeans were skilled traders who controlled important trade routes between Arabia, Egypt, and the Mediterranean. Their wealth allowed them to create a city of unprecedented grandeur in the harsh desert environment. Petra became a major center for the trade of spices, incense, and other luxury goods.

The city's decline began in the 1st century CE when the Romans annexed the Nabataean kingdom. A devastating earthquake in 363 CE caused significant damage, and by the 7th century, Petra was largely abandoned. The city remained unknown to the Western world until 1812, when Swiss explorer Johann Ludwig Burckhardt rediscovered it.

Today, Petra stands as a testament to human ingenuity and the ability to create beauty in the most challenging environments. The site continues to reveal new secrets through ongoing archaeological excavations, offering insights into the sophisticated culture that once thrived in this desert oasis.`,
    excerpt: 'Discover the secrets of the ancient Nabataean city carved into Jordan\'s red sandstone cliffs.',
    category: 'trivia',
    featuredImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
    tags: ['Ancient Civilizations', 'Archaeology', 'Jordan', 'Nabataeans', 'UNESCO'],
    isFeatured: false,
    status: 'published',
    views: 1340,
    metaTitle: 'Petra - Ancient City Carved in Stone',
    metaDescription: 'Explore the ancient Nabataean city of Petra, carved into Jordan\'s red sandstone cliffs.'
  },
  {
    title: 'The Art of Pour-Over: A Morning Ritual',
    excerpt: 'Discover the meditative practice of pour-over coffee and how it transforms your morning routine.',
    category: 'Coffee & Culture',
    featuredImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop',
    tags: ['Coffee', 'Pour-Over', 'Morning Ritual', 'Mindfulness'],
    brewMood: 'Morning Energy',
    pairsWellWith: 'Deep Thoughts',
    isFeatured: true,
    status: 'published',
    views: 2100,
    metaTitle: 'Pour-Over Coffee: A Morning Ritual',
    metaDescription: 'Learn about the art of pour-over coffee and its meditative benefits.'
  },
  {
    title: 'Local Roasters: Hidden Gems in Your City',
    excerpt: 'Explore the thriving local coffee scene and discover roasters who are passionate about their craft.',
    category: 'Local Roasts',
    featuredImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=400&fit=crop',
    tags: ['Local Business', 'Coffee Roasters', 'Community', 'Artisan'],
    brewMood: 'Chill',
    pairsWellWith: 'Travel',
    isFeatured: true,
    status: 'published',
    views: 1850,
    metaTitle: 'Local Coffee Roasters: Hidden Gems',
    metaDescription: 'Discover amazing local coffee roasters in your city.'
  },
  {
    title: 'Mindful Brewing: Coffee as Meditation',
    excerpt: 'How the simple act of brewing coffee can become a form of mindfulness and self-care.',
    category: 'Mind Brew',
    featuredImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop',
    tags: ['Mindfulness', 'Meditation', 'Self-Care', 'Coffee'],
    brewMood: 'Focused',
    pairsWellWith: 'Relaxation',
    isFeatured: true,
    status: 'published',
    views: 1650,
    metaTitle: 'Coffee as Meditation: Mindful Brewing',
    metaDescription: 'Learn how brewing coffee can be a form of mindfulness practice.'
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName}`);
    }

    // Create demo blogs
    const authors = createdUsers.filter(user => user.role === 'author');
    for (let i = 0; i < demoBlogs.length; i++) {
      const blogData = demoBlogs[i];
      const author = authors[i % authors.length]; // Distribute blogs among authors
      
      // Generate slug from title
      const slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const blog = new Blog({
        ...blogData,
        slug: slug,
        author: author._id,
        isDemoContent: true // Flag to mark as demo content
      });
      
      await blog.save();
      console.log(`Created blog: ${blog.title}`);
    }

    console.log('Database seeding completed successfully!');
    console.log(`Created ${createdUsers.length} users and ${demoBlogs.length} blog posts`);
    
    // Display some stats
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const featuredBlogs = await Blog.countDocuments({ isFeatured: true });
    
    console.log('\nDatabase Statistics:');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Blogs: ${totalBlogs}`);
    console.log(`Featured Blogs: ${featuredBlogs}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase(); 