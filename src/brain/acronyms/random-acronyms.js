const ADJECTIVES = {
  'A': "Amazing Awesome Astounding Amusing Agile Adventurous Affectionate Adorable Artistic Athletic Ambitious Astute Adaptable Audacious Amiable Agreeable Astonishing Affable Altruistic".split(" "),
  'B': "Brilliant Bold Bubbly Blazing Blissful Boisterous Bouncy Breezy Brainy Bonkers Benevolent Brawny Bright Bashful Bodacious Bohemian Bizarre Blithesome Bouncy".split(" "),
  'C': "Creative Clever Cheerful Charismatic Chill Charming Cool Courageous Cunning Comedic Compassionate Confident Chipper Captivating Cheeky Chucklesome Crafty Colorful Chivalrous".split(" "),
  'D': "Daring Delightful Dynamic Dazzling Dapper Dreamy Diligent Dandy Devoted Down-to-earth Droll Daringly Dizzying Dainty Dependable Dutiful Dashing Dizzying Determined Dramatic".split(" "),
  'E': "Energetic Exciting Elegant Exuberant Enthusiastic Exceptional Easygoing Effervescent Eager Extraordinary Excellent Entertaining Engaging Elastic Endearing Encouraging Eccentric Enlivening Enchanting".split(" "),
  'F': "Fantastic Fearless Fabulous Funny Fierce Friendly Flamboyant Funky Fresh Fanciful Frank Free Fun-loving Fashionable Fetching Frisky Foolish Farcical Forthright".split(" "),
  'G': "Gleeful Groovy Gallant Gracious Giggly Gorgeous Gutsy Glitzy Grand Grounded Good-humored Genial Great Glittery Giddy Gentle Gung-ho Goofy Gregarious Gifted".split(" "),
  'H': "Happy Hilarious Hearty Humorous Handsome Hopeful Heroic Humble Hypnotic High-spirited Helpful Huggable Hip Honest Hunky Hardy Hot-blooded Harmonious Hyper".split(" "),
  'I': "Incredible Inventive Inspiring Imaginative Invincible Innovative Interesting Irresistible Illustrious Impish Ingenious Insightful Idealistic Independent Ironic Irrepressible Intuitive Intriguing".split(" "),
  'J': "Joyful Jolly Jazzy Jaunty Jubilant Jokey Jocular Jubilatory Juicy Jokingly Jovial Judicious Jumping Jubilant Jubilicious Jam-packed Jaw-dropping Jesting Jubilatory".split(" "),
  'K': "Kind Knowledgeable Keen Kooky Kempt Kicky Kittenish Knitted Knacky Kind-hearted Knarly Kinetic Klutzy Kicky Kooky Kissable Knitted Kickin' Klutzy Kool Kindred".split(" "),
  'L': "Lovely Lively Laughable Loyal Likable Lighthearted Legendary Luminous Luxurious Lavish Laid-back Loud Leaderly Lofty Lavish Lovable Loony Level-headed Luminous".split(" "),
  'M': "Marvelous Magnificent Magical Merry Majestic Mindful Mischievous Mirthful Musical Motivated Magnanimous Masterful Mellow Memorable Modest Mesmerizing Mischief-making Majestic Magnificent".split(" "),
  'N': "Nimble Nice Notable Nurturing Nonchalant Noble Neat Nifty Noteworthy Nutty Neighborly Nurtured Nerdy Notorious Non-stop Nifty Nutty Noblehearted Noteworthy Newfangled".split(" "),
  'O': "Optimistic Outstanding Original Open-minded Outgoing Odd Offbeat Orderly Overjoyed Outrageous Over-the-top Outstanding Obliging Ornate Outlandish Oblivious Overwhelming Open-hearted".split(" "),
  'P': "Playful Positive Pleasant Plucky Peaceful Practical Proactive Perceptive Perfect Powerful Pioneering Plump Passionate Popular Perky Persuasive Punctual Plentiful Polished".split(" "),
  'Q': "Quick Quiet Quaint Quirky Quizzical Quality Quiet Quippy Quirky Queenly Quick-witted Quippy Quixotic Quintessential Quotable Quick-thinking Qualified Quirksome Quick-draw".split(" "),
  'R': "Radiant Resourceful Reliable Rambunctious Refreshing Robust Relentless Rowdy Respectful Remarkable Relaxed Revered Ridiculous Regal Righteous Radiating Radical Rib-tickling".split(" "),
  'S': "Smart Sincere Strong Silly Sweet Splendid Spunky Sassy Sociable Snazzy Spirited Stalwart Serene Supportive Strategic Steadfast Sensational Smiley Spontaneous Sunny".split(" "),
  'T': "Terrific Trustworthy Tenacious Thrilling Thoughtful Tidy Tremendous Talented Ticklish Tactful Top-notch Timeless Trendy Tireless Thundering Thunderstruck Talkative Trippy Transcendent".split(" "),
  'U': "Unique Unstoppable Uplifting Upbeat Understanding Unflappable Unbeatable Unselfish Unorthodox Untamed Unusual Upright Unpretentious Unbelievable Unpredictable Unparalleled Uninhibited Ultra-charming Universal".split(" "),
  'V': "Valiant Vivacious Vibrant Versatile Visionary Vigorous Vivid Vital Virtuous Vibrating Voluptuous Vocal Venerable Volatile Voracious Velvety Voguish Veritable Vigilant Vast".split(" "),
  'W': "Wonderful Witty Wise Wild Warm Whimsical Wondrous Wacky Welcoming Wily Well-rounded Winning Wholehearted Waggish Whiz-bang Waggly Windblown Willing Witty Whopping".split(" "),
  'X': "Xenodochial Xtra-special Xtraordinary Xenial Xcitable Xylographic Xuberant Xany Xylophonic Xplosive Xact Xcited Xploratory Xyresic Xtremely Xemplary Xpressive Xcellent Xtatic".split(" "),
  'Y': "Youthful Yummy Yappy Yielding Yonder Yippee Young-at-heart Yodeling Yearning Youthful Yappy Yummy Yucky Yelling Yo-Yo Yeasty Yare Yonder Yowling".split(" "),
  'Z': "Zany Zappy Zesty Zealous Zippy Zingy Zazzy Zippy Zen Zappy Zillion Zesty Zippy Zephyrous Zippy Zingy Zazzy Zesty Zonked".split(" "),
  '*': "Alluring Breezy Buoyant Dynamic Eccentric Exquisite Fanciful Graceful Harmonious Jovial Jubilant Nimble Pristine Radiant Resilient Spirited Stalwart Thriving Zestful Whimsical".split(" "),
};

const NOUNS = {
  'A': "Aardvark Adventure Apple Aloha Antelope Acrobat Aviator Avocado Amusement Anchor Acrobat Artist Arcade Angel Apricot Autograph Anchor Astronaut Avenger".split(" "),
  'B': "Banana Balloon Bandit Buddy Bumblebee Barnacle Bonfire Biscuit Blueprint Blizzard Baboon Butterscotch Beanbag Boombox Bulldog Bobsled Bowler Boot Bagel Bungee".split(" "),
  'C': "Cactus Clown Carrot Carnival Cookie Caterpillar Cabbage Croissant Coyote Comedian Cupcake Cloud Castle Cricket Clownfish Cobra Cocktail Chimera Cannonball".split(" "),
  'D': "Dinosaur Donut Daydream Dolphin Dragonfly Drumstick Dumpling Dartboard Dominoes Disco Duck Doodle Dune Drum Daquiri Daylight Diadem Dancer Dandelion".split(" "),
  'E': "Elephant Espresso Enchilada Elf Echo Elbow Elevator Eyebrow Eggplant Enigma Engine Elation Eagle Egret Emerald Emperor Emoticon Eclair Elixir".split(" "),
  'F': "Flamingo Firetruck Fiddle Firefly Falcon Fiesta Fudge Falconer Frisbee Fable Fortune Fountain Flapjack Flag Fruit Fuzz Foghorn Fluffy Friend Fishbowl".split(" "),
  'G': "Giraffe Gumball Gargoyle Gecko Galaxy Guitar Geyser Gazebo Goblin Grapefruit Gavel Giggler Gondola Goose Gadget Goblet Glitter Grapes Gravy".split(" "),
  'H': "Hedgehog Hula-hoop Hummus Hippo Helicopter Hammer Headband Hotdog Hoodie Houseboat Hero Hiccup Hologram Hurdle Hat House Handshake Harp Hornet Haystack".split(" "),
  'I': "Igloo Iceberg Iguana Icicle Inkling Idea Inchworm Ice-cream Island Insect Icebox Icon Inventor Icing Illusion Igloo Item Inkwell Iris Icicle".split(" "),
  'J': "Jellyfish Jackpot Jaguar Jamboree Jellybean Jester Jug Jigsaw Joke Jelly Jukebox Jacket Journey Jaguar Jetpack Jam Joke Jar Jungle Jelly".split(" "),
  'K': "Kangaroo Kiwi Knight Kazoo Kite Kitten Kernel Kaleidoscope Karate Key Kettle Kiosk Karaoke Kraken Kebab Kiteboard Kayak King Karate Kickball".split(" "),
  'L': "Lollipop Llama Lobster Luggage Lemur Lint Lullaby Ladybug Lighthouse Lizard Lemon Lasso Locket Lantern Leprechaun Lollipop Limo Laughter Lifeboat Lava".split(" "),
  'M': "Marmalade Marshmallow Mustache Monkey Mongoose Muffin Megaphone Mullet Macaroon Magician Melon Mountain Mongoose Motorboat Mermaid Marvel Muffler Moth Mystery".split(" "),
  'N': "Noodle Nacho Narwhal Nugget Nonsense Nectar Napkin Nebula Nestle Nomad Nectarine Notebook Noodle Nutmeg Neutron Ninja Nutcracker Nightlight Newt Napper".split(" "),
  'O': "Octopus Omelet Orca Oboe Opera Ostrich Oatmeal Orange Otter Osprey Orbit Ocelot Omen Overcoat Ornament Oasis Optimist Oracle Oxygen Oregano".split(" "),
  'P': "Penguin Pancake Pickle Pirate Parrot Parasol Pinwheel Peanut Penguin Popcorn Pony Peanut Puppet Pizza Panda Pogo Pumpkin Popsicle Puffball Polka".split(" "),
  'Q': "Quokka Quiche Quiver Quokka Quiz Quasar Quest Quail Quarterback Quartz Quicksand Quiver Quill Quartet Quokka Quill Quilt Quickstep Quizzer Quest".split(" "),
  'R': "Raccoon Rocket Rainbow Riddle Rhino Raindrop Reindeer Robot Rattlesnake Rhino Root Rhapsody Roadster Raspberry Rook Rebel Radiator Raincoat Razorback".split(" "),
  'S': "Squirrel Sunshine Sausage Starfish Seahorse Sasquatch Skyscraper Sundae Scooter Snowflake Satellite Sunflower Stethoscope Sloth Skateboard Sparkle Sheriff Superhero".split(" "),
  'T': "Turtle Trolley Tornado Tuxedo Tomato Tiger Trampoline Toothbrush Train Tapir Trophy Tambourine Turtleneck Truck Tacos Trumpet Tinsel Tentacle Thermos Tambourine".split(" "),
  'U': "Umbrella Unicorn Ukulele UFO Urchin Ukelele Umpire Underwear Urn Upgrade Unicorn Unit Unicycle Universe Upside Ultra Urgency Utensil Ultraviolet".split(" "),
  'V': "Volcano Violin Viking Vulture Velvet Vault Vine Villain Visionary Visitor Viking Viper Victory Valentine Vortex Veggie Vinegar Vision Villager Vacuum".split(" "),
  'W': "Walrus Waffle Wizard Waterfall Wombat Wig Warmth Wave Wheel Wagon Warrior Wand Watermelon Wigwam Windsock Wombat Waterpark Wagon Wheel Wildcard".split(" "),
  'X': "Xylophone Xenon Xerox Xylophone Xylophone Xenon Xylophone Xoelot Xylem Xerus Xebec Xylographer Xenophobe Xerus Xylograph Xebec Xerox Xenon Xylophage Xerophyte".split(" "),
  'Y': "Yak Yawn Yacht Yeti Yo-yo Yolk Yarn Yogi Yodel Yeti Yard Yak Yawn Yeti Yogurt Yoyo Yearling Yam Yawn Yak Yarn".split(" "),
  'Z': "Zeppelin Zebra Zucchini Ziggurat Zenith Zookeeper Zap Zinger Zeppelin Zip Zoot Suit Zombie Zephyr Zebra Zorro Zamboni Zither Zucchini Zenith".split(" "),
  '*': "Tarantula Unicycle Waterfall Pudding Cupcake Domino Clam Bat Pancake Whistle Fluff Marshmallow Garden Sunset Beach Flower Feather Falcon Dingo Nugget".split(" ")
};

function randomWord(wordsMap, letter) {
  if (letter in wordsMap)
    return wordsMap[letter][Math.floor(Math.random() * 20)];

  return wordsMap['*'][Math.floor(Math.random() * 20)];
}

export default class RandomAcronyms {
  define(acronym) {
    const adjectives = Array(acronym.length - 1).fill().map((_, index) => randomWord(ADJECTIVES, acronym[index]));
    return adjectives.concat([randomWord(NOUNS, acronym[acronym.length - 1])]).join(" ");
  }
}
