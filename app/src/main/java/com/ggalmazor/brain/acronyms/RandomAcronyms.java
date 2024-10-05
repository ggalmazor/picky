package com.ggalmazor.brain.acronyms;

import com.ggalmazor.brain.Acronyms;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Acronyms implementation that returns random acronym descriptions
 */
public class RandomAcronyms implements Acronyms {
    private static final Map<Character, String[]> ADJECTIVES = new HashMap<>();
    private static final Map<Character, String[]> NOUNS = new HashMap<>();

    static {
        ADJECTIVES.put('A', "Amazing Awesome Astounding Amusing Agile Adventurous Affectionate Adorable Artistic Athletic Ambitious Astute Adaptable Audacious Amiable Agreeable Astonishing Affable Altruistic".split(" "));
        ADJECTIVES.put('B', "Brilliant Bold Bubbly Blazing Blissful Boisterous Bouncy Breezy Brainy Bonkers Benevolent Brawny Bright Bashful Bodacious Bohemian Bizarre Blithesome Bouncy".split(" "));
        ADJECTIVES.put('C', "Creative Clever Cheerful Charismatic Chill Charming Cool Courageous Cunning Comedic Compassionate Confident Chipper Captivating Cheeky Chucklesome Crafty Colorful Chivalrous".split(" "));
        ADJECTIVES.put('D', "Daring Delightful Dynamic Dazzling Dapper Dreamy Diligent Dandy Devoted Down-to-earth Droll Daringly Dizzying Dainty Dependable Dutiful Dashing Dizzying Determined Dramatic".split(" "));
        ADJECTIVES.put('E', "Energetic Exciting Elegant Exuberant Enthusiastic Exceptional Easygoing Effervescent Eager Extraordinary Excellent Entertaining Engaging Elastic Endearing Encouraging Eccentric Enlivening Enchanting".split(" "));
        ADJECTIVES.put('F', "Fantastic Fearless Fabulous Funny Fierce Friendly Flamboyant Funky Fresh Fanciful Frank Free Fun-loving Fashionable Fetching Frisky Foolish Farcical Forthright".split(" "));
        ADJECTIVES.put('G', "Gleeful Groovy Gallant Gracious Giggly Gorgeous Gutsy Glitzy Grand Grounded Good-humored Genial Great Glittery Giddy Gentle Gung-ho Goofy Gregarious Gifted".split(" "));
        ADJECTIVES.put('H', "Happy Hilarious Hearty Humorous Handsome Hopeful Heroic Humble Hypnotic High-spirited Helpful Huggable Hip Honest Hunky Hardy Hot-blooded Harmonious Hyper".split(" "));
        ADJECTIVES.put('I', "Incredible Inventive Inspiring Imaginative Invincible Innovative Interesting Irresistible Illustrious Impish Ingenious Insightful Idealistic Independent Ironic Irrepressible Intuitive Intriguing".split(" "));
        ADJECTIVES.put('J', "Joyful Jolly Jazzy Jaunty Jubilant Jokey Jocular Jubilatory Juicy Jokingly Jovial Judicious Jumping Jubilant Jubilicious Jam-packed Jaw-dropping Jesting Jubilatory".split(" "));
        ADJECTIVES.put('K', "Kind Knowledgeable Keen Kooky Kempt Kicky Kittenish Knitted Knacky Kind-hearted Knarly Kinetic Klutzy Kicky Kooky Kissable Knitted Kickin' Klutzy Kool Kindred".split(" "));
        ADJECTIVES.put('L', "Lovely Lively Laughable Loyal Likable Lighthearted Legendary Luminous Luxurious Lavish Laid-back Loud Leaderly Lofty Lavish Lovable Loony Level-headed Luminous".split(" "));
        ADJECTIVES.put('M', "Marvelous Magnificent Magical Merry Majestic Mindful Mischievous Mirthful Musical Motivated Magnanimous Masterful Mellow Memorable Modest Mesmerizing Mischief-making Majestic Magnificent".split(" "));
        ADJECTIVES.put('N', "Nimble Nice Notable Nurturing Nonchalant Noble Neat Nifty Noteworthy Nutty Neighborly Nurtured Nerdy Notorious Non-stop Nifty Nutty Noblehearted Noteworthy Newfangled".split(" "));
        ADJECTIVES.put('O', "Optimistic Outstanding Original Open-minded Outgoing Odd Offbeat Orderly Overjoyed Outrageous Over-the-top Outstanding Obliging Ornate Outlandish Oblivious Overwhelming Open-hearted".split(" "));
        ADJECTIVES.put('P', "Playful Positive Pleasant Plucky Peaceful Practical Proactive Perceptive Perfect Powerful Pioneering Plump Passionate Popular Perky Persuasive Punctual Plentiful Polished".split(" "));
        ADJECTIVES.put('Q', "Quick Quiet Quaint Quirky Quizzical Quality Quiet Quippy Quirky Queenly Quick-witted Quippy Quixotic Quintessential Quotable Quick-thinking Qualified Quirksome Quick-draw".split(" "));
        ADJECTIVES.put('R', "Radiant Resourceful Reliable Rambunctious Refreshing Robust Relentless Rowdy Respectful Remarkable Relaxed Revered Ridiculous Regal Righteous Radiating Radical Rib-tickling".split(" "));
        ADJECTIVES.put('S', "Smart Sincere Strong Silly Sweet Splendid Spunky Sassy Sociable Snazzy Spirited Stalwart Serene Supportive Strategic Steadfast Sensational Smiley Spontaneous Sunny".split(" "));
        ADJECTIVES.put('T', "Terrific Trustworthy Tenacious Thrilling Thoughtful Tidy Tremendous Talented Ticklish Tactful Top-notch Timeless Trendy Tireless Thundering Thunderstruck Talkative Trippy Transcendent".split(" "));
        ADJECTIVES.put('U', "Unique Unstoppable Uplifting Upbeat Understanding Unflappable Unbeatable Unselfish Unorthodox Untamed Unusual Upright Unpretentious Unbelievable Unpredictable Unparalleled Uninhibited Ultra-charming Universal".split(" "));
        ADJECTIVES.put('V', "Valiant Vivacious Vibrant Versatile Visionary Vigorous Vivid Vital Virtuous Vibrating Voluptuous Vocal Venerable Volatile Voracious Velvety Voguish Veritable Vigilant Vast".split(" "));
        ADJECTIVES.put('W', "Wonderful Witty Wise Wild Warm Whimsical Wondrous Wacky Welcoming Wily Well-rounded Winning Wholehearted Waggish Whiz-bang Waggly Windblown Willing Witty Whopping".split(" "));
        ADJECTIVES.put('X', "Xenodochial Xtra-special Xtraordinary Xenial Xcitable Xylographic Xuberant Xany Xylophonic Xplosive Xact Xcited Xploratory Xyresic Xtremely Xemplary Xpressive Xcellent Xtatic".split(" "));
        ADJECTIVES.put('Y', "Youthful Yummy Yappy Yielding Yonder Yippee Young-at-heart Yodeling Yearning Youthful Yappy Yummy Yucky Yelling Yo-Yo Yeasty Yare Yonder Yowling".split(" "));
        ADJECTIVES.put('Z', "Zany Zappy Zesty Zealous Zippy Zingy Zazzy Zippy Zen Zappy Zillion Zesty Zippy Zephyrous Zippy Zingy Zazzy Zesty Zonked".split(" "));
        ADJECTIVES.put('*', "Alluring Breezy Buoyant Dynamic Eccentric Exquisite Fanciful Graceful Harmonious Jovial Jubilant Nimble Pristine Radiant Resilient Spirited Stalwart Thriving Zestful Whimsical".split(" "));
        NOUNS.put('A', "Aardvark Adventure Apple Aloha Antelope Acrobat Aviator Avocado Amusement Anchor Acrobat Artist Arcade Angel Apricot Autograph Anchor Astronaut Avenger".split(" "));
        NOUNS.put('B', "Banana Balloon Bandit Buddy Bumblebee Barnacle Bonfire Biscuit Blueprint Blizzard Baboon Butterscotch Beanbag Boombox Bulldog Bobsled Bowler Boot Bagel Bungee".split(" "));
        NOUNS.put('C', "Cactus Clown Carrot Carnival Cookie Caterpillar Cabbage Croissant Coyote Comedian Cupcake Cloud Castle Cricket Clownfish Cobra Cocktail Chimera Cannonball".split(" "));
        NOUNS.put('D', "Dinosaur Donut Daydream Dolphin Dragonfly Drumstick Dumpling Dartboard Dominoes Disco Duck Doodle Dune Drum Daquiri Daylight Diadem Dancer Dandelion".split(" "));
        NOUNS.put('E', "Elephant Espresso Enchilada Elf Echo Elbow Elevator Eyebrow Eggplant Enigma Engine Elation Eagle Egret Emerald Emperor Emoticon Eclair Elixir".split(" "));
        NOUNS.put('F', "Flamingo Firetruck Fiddle Firefly Falcon Fiesta Fudge Falconer Frisbee Fable Fortune Fountain Flapjack Flag Fruit Fuzz Foghorn Fluffy Friend Fishbowl".split(" "));
        NOUNS.put('G', "Giraffe Gumball Gargoyle Gecko Galaxy Guitar Geyser Gazebo Goblin Grapefruit Gavel Giggler Gondola Goose Gadget Goblet Glitter Grapes Gravy".split(" "));
        NOUNS.put('H', "Hedgehog Hula-hoop Hummus Hippo Helicopter Hammer Headband Hotdog Hoodie Houseboat Hero Hiccup Hologram Hurdle Hat House Handshake Harp Hornet Haystack".split(" "));
        NOUNS.put('I', "Igloo Iceberg Iguana Icicle Inkling Idea Inchworm Ice-cream Island Insect Icebox Icon Inventor Icing Illusion Igloo Item Inkwell Iris Icicle".split(" "));
        NOUNS.put('J', "Jellyfish Jackpot Jaguar Jamboree Jellybean Jester Jug Jigsaw Joke Jelly Jukebox Jacket Journey Jaguar Jetpack Jam Joke Jar Jungle Jelly".split(" "));
        NOUNS.put('K', "Kangaroo Kiwi Knight Kazoo Kite Kitten Kernel Kaleidoscope Karate Key Kettle Kiosk Karaoke Kraken Kebab Kiteboard Kayak King Karate Kickball".split(" "));
        NOUNS.put('L', "Lollipop Llama Lobster Luggage Lemur Lint Lullaby Ladybug Lighthouse Lizard Lemon Lasso Locket Lantern Leprechaun Lollipop Limo Laughter Lifeboat Lava".split(" "));
        NOUNS.put('M', "Marmalade Marshmallow Mustache Monkey Mongoose Muffin Megaphone Mullet Macaroon Magician Melon Mountain Mongoose Motorboat Mermaid Marvel Muffler Moth Mystery".split(" "));
        NOUNS.put('N', "Noodle Nacho Narwhal Nugget Nonsense Nectar Napkin Nebula Nestle Nomad Nectarine Notebook Noodle Nutmeg Neutron Ninja Nutcracker Nightlight Newt Napper".split(" "));
        NOUNS.put('O', "Octopus Omelet Orca Oboe Opera Ostrich Oatmeal Orange Otter Osprey Orbit Ocelot Omen Overcoat Ornament Oasis Optimist Oracle Oxygen Oregano".split(" "));
        NOUNS.put('P', "Penguin Pancake Pickle Pirate Parrot Parasol Pinwheel Peanut Penguin Popcorn Pony Peanut Puppet Pizza Panda Pogo Pumpkin Popsicle Puffball Polka".split(" "));
        NOUNS.put('Q', "Quokka Quiche Quiver Quokka Quiz Quasar Quest Quail Quarterback Quartz Quicksand Quiver Quill Quartet Quokka Quill Quilt Quickstep Quizzer Quest".split(" "));
        NOUNS.put('R', "Raccoon Rocket Rainbow Riddle Rhino Raindrop Reindeer Robot Rattlesnake Rhino Root Rhapsody Roadster Raspberry Rook Rebel Radiator Raincoat Razorback".split(" "));
        NOUNS.put('S', "Squirrel Sunshine Sausage Starfish Seahorse Sasquatch Skyscraper Sundae Scooter Snowflake Satellite Sunflower Stethoscope Sloth Skateboard Sparkle Sheriff Superhero".split(" "));
        NOUNS.put('T', "Turtle Trolley Tornado Tuxedo Tomato Tiger Trampoline Toothbrush Train Tapir Trophy Tambourine Turtleneck Truck Tacos Trumpet Tinsel Tentacle Thermos Tambourine".split(" "));
        NOUNS.put('U', "Umbrella Unicorn Ukulele UFO Urchin Ukelele Umpire Underwear Urn Upgrade Unicorn Unit Unicycle Universe Upside Ultra Urgency Utensil Ultraviolet".split(" "));
        NOUNS.put('V', "Volcano Violin Viking Vulture Velvet Vault Vine Villain Visionary Visitor Viking Viper Victory Valentine Vortex Veggie Vinegar Vision Villager Vacuum".split(" "));
        NOUNS.put('W', "Walrus Waffle Wizard Waterfall Wombat Wig Warmth Wave Wheel Wagon Warrior Wand Watermelon Wigwam Windsock Wombat Waterpark Wagon Wheel Wildcard".split(" "));
        NOUNS.put('X', "Xylophone Xenon Xerox Xylophone Xylophone Xenon Xylophone Xoelot Xylem Xerus Xebec Xylographer Xenophobe Xerus Xylograph Xebec Xerox Xenon Xylophage Xerophyte".split(" "));
        NOUNS.put('Y', "Yak Yawn Yacht Yeti Yo-yo Yolk Yarn Yogi Yodel Yeti Yard Yak Yawn Yeti Yogurt Yoyo Yearling Yam Yawn Yak Yarn".split(" "));
        NOUNS.put('Z', "Zeppelin Zebra Zucchini Ziggurat Zenith Zookeeper Zap Zinger Zeppelin Zip Zoot Suit Zombie Zephyr Zebra Zorro Zamboni Zither Zucchini Zenith".split(" "));
        NOUNS.put('*', "Tarantula Unicycle Waterfall Pudding Cupcake Domino Clam Bat Pancake Whistle Fluff Marshmallow Garden Sunset Beach Flower Feather Falcon Dingo Nugget".split(" "));
    }

    private final Random rnd;

    public RandomAcronyms() {
        this.rnd = new Random();
    }

    public RandomAcronyms(Random rnd) {
        this.rnd = rnd;
    }

    /**
     * Replaces the internal list of adjectives and nouns that will be used to describe acronyms
     *
     * @param adjectives
     * @param nouns
     */
    static void loadWords(Map<Character, String[]> adjectives, Map<Character, String[]> nouns) {
        ADJECTIVES.putAll(adjectives);
        NOUNS.putAll(nouns);
    }

    /**
     * Returns a random description for the provided acronym
     *
     * @param acronym
     * @return the acronym's (random) description
     */
    @Override
    public String getDescription(String acronym) {
        StringBuilder description = new StringBuilder();

        for (int i = 0; i < acronym.length() - 1; i++) {
            char letter = Character.toUpperCase(acronym.charAt(i));
            String adjective = randomAdjectiveFor(ADJECTIVES, letter);
            description.append(adjective).append(" ");
        }

        char lastLetter = Character.toUpperCase(acronym.charAt(acronym.length() - 1));
        description.append(randomAdjectiveFor(NOUNS, lastLetter));

        return description.toString();
    }

    private String randomAdjectiveFor(Map<Character, String[]> wordsMap, char letter) {
        var adjectives = wordsMap.containsKey(letter) ? wordsMap.get(letter) : wordsMap.get('*');

        return adjectives[rnd.nextInt(adjectives.length)];
    }
}
