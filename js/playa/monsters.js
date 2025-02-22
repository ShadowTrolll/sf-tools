// All monster related data

const NAME_UNIT_UNDERWORLD = {
  0: 'Goblin',
  1: 'Troll',
  2: 'Keeper'
}

const NAME_UNIT_COMPANION = {
  391: 'Bert',
  392: 'Mark',
  393: 'Kunigunde'
}

const NAME_MONSTER = {
  1: 'Dirty Bat',
  2: 'Bat Out of hell',
  3: 'Dusty Bat',
  4: 'Flesh Golem',
  5: 'Zombie',
  6: 'Undead',
  7: 'Firelog',
  8: 'Frost Demon',
  9: 'Rattling Cobra',
  10: 'Shadow Cobra',
  11: 'Nutty Natter',
  12: 'Spittle Cobra',
  13: 'Polar Bear',
  14: 'Problem Bear',
  15: 'Brown Bear',
  16: 'Infected Brown Bear',
  17: 'Green Rex',
  18: 'Red Rex',
  19: 'Grey Rex',
  20: 'Snow Troll',
  21: 'Night Troll',
  22: 'Mountain Troll',
  23: 'Stone Troll',
  24: 'Grey Vulture',
  25: 'Culture Vulture',
  26: 'Pack Rat',
  27: 'Albino Rat',
  28: 'Sewer Rat',
  29: 'Forest Muncher',
  30: 'Swamp Muncher',
  31: 'Night Ghoul',
  32: 'Grey Ghoul',
  33: 'Swamp Ghoul',
  34: 'Snapping Raptor',
  35: 'Jumping Raptor',
  36: 'Roaring Raptor',
  37: 'Bigfoot',
  38: 'Yeti',
  39: 'Mean Monster Rabbit',
  40: 'Choleric Monster Rabbit',
  41: 'Killer Monster Rabbit',
  42: 'Pink Monster Rabbit',
  43: 'Lunatic Monster Rabbit',
  44: 'Toxic Monster Rabbit',
  45: 'Pirate Dark Beard',
  46: 'Sturdy Swashbuckler',
  47: 'Pirate Blood Nose',
  48: 'Evil Taurus',
  49: 'Sulky Taurus',
  50: 'Total Bull',
  51: 'Stone Giant',
  52: 'Lava Giant',
  53: 'Green Gnoll',
  54: 'Grey Gnoll',
  55: 'Red Gnoll',
  56: 'Giant Spider',
  57: 'Terror Tarantula',
  58: 'Tree Spider',
  59: 'Snow Lion',
  60: 'Tiger',
  61: 'Panther',
  62: 'Mountain Lion',
  63: 'Hell Scorpion',
  64: 'Jungle Scorpion',
  65: 'Shadow Scorpion',
  66: 'Fire Scorpion',
  67: 'Redlight Succubus',
  68: 'Swamp Nymphomaniac',
  69: 'Bride From Hell',
  70: 'Witch',
  71: 'Brown Centaur',
  72: 'Green Centaur',
  73: 'Grey Centaur',
  74: 'Banshee',
  75: 'Biting Mutt',
  76: 'Ice Wolf',
  77: 'Rabid Wolf',
  78: 'Grim Wolf',
  79: 'Mud Blob',
  80: 'Sand Blob',
  81: 'Slime Blob',
  82: 'Lava Blob',
  83: 'Blood-thirsty Vampire',
  84: 'Devious Vampire',
  85: 'Sinister Vampire',
  86: 'Ugly Gremlin',
  87: 'Cruel Gremlin',
  88: 'Greedy Gremlin',
  89: 'Greenish Gremlin',
  90: 'Demoralizing Demon',
  91: 'Terrifying Demon',
  92: 'Abhorrent Demon',
  93: 'Bad Bandit',
  94: 'Rowdy Robber',
  95: 'Thoughtless Thief',
  96: 'Basilisk',
  97: 'Fire Basilisk',
  98: 'Twilight Alien',
  99: 'Hell Alien',
  100: 'Toxic Alien',
  101: 'Dark Rider',
  102: 'Fire Elemental',
  103: 'Gray Gargoyle',
  104: 'Brown Gargoyle',
  105: 'Swamp Crocodile',
  106: 'Frost Alligator',
  107: 'Shadow Alligator',
  108: 'Mud Crocodile',
  109: 'White Gorilla',
  110: 'Forest Gorilla',
  111: 'Mountain Gorilla',
  112: 'Skeleton',
  113: 'Voodoo Skeleton',
  114: 'Voodoo Master',
  115: 'Skeleton Warrior',
  116: 'Skeleton Soldier',
  117: 'Horror of the Night',
  118: 'Swamp Gorgon',
  119: 'Night Gorgon',
  120: 'Baby Elephant',
  121: 'Lion',
  122: 'Wild Boar',
  123: 'Wild Sod',
  124: 'Wind Elemental',
  125: 'Sandstorm',
  126: 'Blowflies',
  127: 'Terror Tree',
  128: 'Toxic Tree',
  129: 'Ghost',
  130: 'Fire Glompf',
  131: 'Water Glompf',
  132: 'Swamp Glompf',
  133: 'Cycling Cyclops',
  134: 'Sand Cyclops',
  135: 'Hell Cyclops',
  136: 'Cave Cyclops',
  137: 'Octopus',
  138: 'Timmy Suprino',
  139: 'Gray Dragon',
  140: 'Dirty Rotten Scoundrel',
  141: 'Cutthroat',
  142: 'Grave Robber',
  143: 'Black Phantom',
  144: 'Unholy Monk',
  145: 'Guy in a cowl',
  146: 'Dragon of Madness',
  147: 'Dragon of Cold',
  148: 'Dragon of Hell',
  149: 'Giant Dragon',
  150: 'Slashing Saurus',
  151: 'Saurus Rogue',
  152: 'Mountain Warrior',
  153: 'Swamp Warrior',
  154: 'The Extraterrestrial',
  155: 'Illegal Alien',
  156: 'Out of State Alien',
  157: 'Little Green Man',
  158: 'Dragon of Darkness',
  159: 'Black Skull Warrior',
  160: 'Toxic Dragon',
  161: 'Swamp Dragon',
  162: 'Beastie',
  163: 'Man-Eater',
  164: 'Killing Machine',
  165: 'Knight of the Black Skull',
  166: 'Lord of Darkness',
  167: 'Terrible Toxic Gremlin',
  168: 'Ghost of the Volcano',
  169: 'Hell Beast',
  170: 'Robber Chief',
  171: 'King Saurus',
  172: 'Pirate Leader',
  173: 'Happy Slappy the Clown',
  174: 'The Blind Knife Thrower',
  175: 'Miniature Gnome',
  176: 'The Bearded Lady',
  177: 'The Psycho Juggler',
  178: 'Siamese Twins',
  179: 'Bronco the Joker',
  180: 'The Snake-man',
  181: 'Madame Mystique',
  182: 'Bozo the Terror Clown',
  183: 'Restless Soul',
  184: 'Furious Soul',
  185: 'Old Soul',
  186: 'Pest',
  187: 'Soul Clump',
  188: 'Scourge',
  189: 'Hellhound',
  190: 'The Fuehrer\'s Heap',
  191: 'The Devil\'s Advocate',
  192: 'Beelzeboss',
  193: 'Neon yellow death',
  194: 'Hobgoblin\'s boat',
  195: 'Starfish of death',
  196: 'Terror from the deep',
  197: 'Beastly brat',
  198: 'King of the dark dwarves',
  199: 'Invisible threat',
  200: 'Biggie the Pimp',
  201: 'The Count',
  202: 'Goblin mage',
  203: 'Djinn',
  204: 'Ninja gnomes',
  205: 'Titan',
  206: 'Super-assassin',
  207: 'The Dead Baron',
  208: 'Hydra',
  209: 'Blind Cyclops',
  210: 'Klomann the Barbarian',
  211: 'Cerberus',
  212: 'Zombie Berserker',
  213: 'The thing',
  214: 'Cute kitten',
  215: 'Armored dragon',
  216: 'Butthead',
  217: 'Pets',
  218: 'Bat hags',
  219: 'Dancing ogre brothers',
  220: 'Ungorth the Merciless',
  221: 'Cybernetic zombie',
  222: 'War ogre of war',
  223: 'Archdemon of confusion',
  224: 'Valkyrie',
  225: 'Big-mouth of doom',
  226: 'Ping Pong',
  227: 'Boogerus the Booger Giant',
  228: 'Shniva',
  229: 'AfterDarkor',
  230: 'Armored fire dragon',
  231: 'Werewolf',
  232: 'Crococopter',
  233: 'Gripcut the Ghastly',
  234: 'Gragosh the Destroyer',
  235: 'Ragorth the Vengeful',
  236: 'Slobba the Mudd',
  237: 'Fat Elke',
  238: 'The mother-in-law',
  239: 'Reaper man',
  240: 'Debugger\'s Doom',
  241: 'AI',
  242: 'The boss',
  243: 'Hellgore the Hellish',
  244: 'Henry the Magic Fairy',
  245: 'Jet the Panty Raider',
  246: 'Clapper van Hellsing',
  247: 'The KOma KOmmander',
  248: 'Roughian the Ruthless',
  249: 'Ben the Marketeer',
  250: 'Hector the Contractor',
  251: 'Motu with a Club',
  252: 'Jack the Hammerer',
  253: 'Thesi the Terrible',
  254: 'Peter the Impaler',
  255: 'Gert the Ghastly',
  256: 'Leander, Lord of Lies',
  257: 'Hannah the Hellish',
  258: 'Alex, Angel of Abyss',
  259: 'Jan the Hacker',
  260: 'Four-handed Peter ',
  261: 'The Artist formerly known as Andreas',
  262: 'Marv the Minor Evil',
  400: 'Living Cake Man',
  401: 'Green Fairy Drinkerbell',
  402: 'Tinvalid',
  403: 'Harmless Teddy Bear',
  404: 'Flowerlina',
  405: 'Tooth Fairy',
  406: 'Ugly Chick',
  407: 'Warbling Birdie',
  408: 'Well-Meaning Fairy',
  409: 'Trickeribook\'s Cheatinchild',
  410: 'Singing Dumpling',
  411: 'Puppeteer\'s Right',
  412: 'Grinning Cat',
  413: 'Ambitious Frog',
  414: 'Pinociwhatsit',
  415: '3x3 Wishes',
  416: 'Bootlegged Puss',
  417: 'Dotty from Kansas',
  418: 'The Last Airgazer',
  419: 'A Rabbit and a Hedgehog',
  420: 'Holger Nilsson',
  421: 'High-Spirited Ghost',
  422: 'Blood-Red Riding Hood',
  423: 'Snowflake',
  424: 'Star Money',
  425: 'Miss Match',
  426: 'Ice Queen',
  427: 'Badly Raised Boys',
  428: 'Lambikins and Fishy',
  429: 'Donkey Shot',
  430: 'Street Thief with Monkey',
  431: 'Alice in Wonder',
  432: 'Penterabbit',
  433: 'Dynamic Peter',
  434: 'Foolish Princess',
  435: 'Pleasure Addict',
  436: 'Amnastasia Rubliovka',
  437: 'Useless Livestock',
  438: 'Humpty Dumpty',
  439: 'King Chinbeard',
  440: 'Sandman',
  441: 'John or Tom?',
  442: 'Scarecrow',
  443: 'Mirrored Fool',
  444: 'Three Little Pigs',
  445: 'Goose in Luck',
  446: 'Simpleminded Chicken Thief',
  447: 'Baba Yaga',
  448: 'Merlin',
  449: 'Julio and Romy',
  450: 'Prince in Shepherd\'s Skin',
  451: 'Robin the Redistributor',
  452: 'Ali the Sesame Opener',
  453: 'Freshly Dressed Emperor',
  454: 'Dumbo',
  455: 'Hansel and Gretel',
  456: 'Bear Fear',
  457: 'Pokerhontas',
  458: 'Mass Fly Murderer',
  459: 'Cinderella',
  460: 'The Enchanting Genie',
  461: 'Bronycorn',
  462: 'Hulda the Cloud Fairy',
  463: 'Leprechore',
  464: 'Robber Hopsenplops',
  465: 'Thorny Lion',
  466: 'Aquirella the Dazzler',
  467: 'Prince Charming',
  468: 'B. O. Wolf',
  469: 'Peter the Wolf',
  470: 'Beautiful Princess',
  471: 'Fearless Wanderer',
  472: 'Red&White Forever',
  473: 'Friendly Snowman',
  474: 'Parsifal',
  475: 'Brother Barfly',
  476: 'King Arthur',
  477: 'Sigi Musclehead',
  478: 'Pied Piper',
  479: 'The Guys from Oz',
  480: '"Little" John',
  481: 'The Easter Bunny',
  482: 'Honey Robbear',
  483: 'Shirk the Ogre',
  484: 'Cozy Bear',
  485: 'Number Nip',
  486: 'Three Hungry Bears',
  487: 'Seven Hostages',
  488: 'Seven Dwarfs',
  489: 'Respectable Dragon Slayer',
  490: 'Ducat Donkey',
  491: 'Bean Counter',
  492: 'Happy Dragon',
  493: 'Shockheaded Jack',
  494: 'Papa Frost',
  495: 'Dream Couple',
  496: 'Three Ghosts',
  497: 'Sleepy Princess',
  498: 'Nanobot Porridge',
  499: 'Barbpunzel',
  500: 'Prickly Beast',
  501: 'Rotten Crow',
  502: 'Skinny Skeleton',
  503: 'Cellar Zombie',
  504: 'Horned One',
  505: 'Toppled One',
  506: 'Bloodlusty Butcher',
  507: 'Dark Archer',
  508: 'Lance Strongarm',
  509: 'Femme Fatariel',
  510: 'Bad Bat',
  511: 'Sabertoothed Kitty',
  512: 'Sand Roach',
  513: 'Mummed Mummy',
  514: 'Plunderblargh',
  515: 'Snailing',
  516: 'Slashing Serpent',
  517: 'Quadroslayer',
  518: 'Lambent Limbeater',
  519: 'Torturiel',
  520: 'Little Badgerer',
  521: 'Big Badgerer',
  522: 'Terrifying Toad',
  523: 'B00n Demon',
  524: 'Goggly Beast',
  525: 'Clubber',
  526: 'Reckless Reaper',
  527: 'Eight-legged Arachnid',
  528: 'Deep Priest',
  529: 'Mephissimo',
  530: 'Bottomcreeper',
  531: 'Evil Enchantress',
  532: 'Ruminant',
  533: 'Old Purplehand',
  534: 'Mega Balrog',
  535: 'Archfallen',
  536: 'Phantasto the Blacksmith',
  537: 'Great Uncle of Untidiness',
  538: 'Terrible Tinkerer',
  539: 'Variablo',
  540: 'Impulsive Imp',
  541: 'Henchdemon',
  542: 'Horror on Ice',
  543: 'Furious Fury',
  544: 'Flayer',
  545: 'Stomper',
  546: 'Bloodthirsty Baron',
  547: 'Brain Leech',
  548: 'Executor',
  549: 'Evil Eel',
  550: 'Beast',
  551: 'Hunchbacked Zombie',
  552: 'Full Duplex Zombie',
  553: 'Thorny Devourer',
  554: 'Sinister Smasher',
  555: 'Unspeakable',
  556: 'Corpus Eruptus',
  557: 'Masterful Massacrist',
  558: 'Eight Legged Ariane',
  559: 'King Knuckelbone',
  560: 'Ritualist',
  561: 'Desert Devourer',
  562: 'Snaker',
  563: 'Snake Mage',
  564: 'Gory Gatherer',
  565: 'Lithic Leviathan',
  566: 'Ghastly Grey',
  567: 'Malicious Martha',
  568: 'Big Z',
  569: 'Father of Lies',
  570: 'Spikey Spiteful',
  571: 'Hellmutt',
  572: 'Soldier of Doom',
  573: 'Blood Occultist',
  574: 'Biting Batbuck',
  575: 'His Pestilence',
  576: 'Obstructor',
  577: 'Martyrdom\'s Maiden',
  578: 'Muscular Muzzle',
  579: 'Azmo Fantasmo',
  580: 'Premature Hellspawn',
  581: 'Angel of Pain',
  582: 'h4xx0r',
  583: 'Loricate Biter',
  584: 'Slender Person',
  585: 'Hammerer',
  586: 'Horrendous Hag',
  587: 'Deeply Fallen',
  588: 'Demon of Terror',
  589: 'Exitus Prime',
  590: 'Brute',
  591: 'Nasty Trapper',
  592: 'Executor',
  593: 'Fatty on the Rocks',
  594: 'Ex-Exorcist',
  595: 'Death Dispenser',
  596: 'Shadow of Power',
  597: 'Horned Witch',
  598: 'Death\'s Best Buddy',
  599: 'Devourer of Souls',
  600: 'Robert Drunkatheon',
  601: 'Lefty Lennister',
  602: 'Petyr the Pimp',
  603: 'Holundor',
  604: 'Drogo the Threatening',
  605: 'The Ginger Slowworm',
  606: 'Queen Mother',
  607: 'The Miniature Poodle',
  608: 'The Riding Mountainrange',
  609: 'Joffrey the Kid Despot',
  610: 'Cool Villain',
  611: 'Brygitte',
  612: 'Snowman and Shadow Wolf',
  613: 'The Woman in Red',
  614: 'Boyish Brienne',
  615: 'Ramsay the Degrader',
  616: 'Faceless',
  617: 'Vicious Gnome',
  618: 'The Protector',
  619: 'The Hard to Burn',
  710: 'Ordinary foot soldier',
  711: 'Experienced warrior',
  712: 'Elite infantry',
  720: 'Talented mageling',
  721: 'Old warlock',
  722: 'Grand Maester of Magic',
  730: 'Short bow amateur',
  731: 'Precision sniper',
  732: 'Pincusheneress of the Night',
  740: 'Semirigid palisade trench',
  741: 'Puny Picket Fence',
  742: 'Puny Picket Fence with look-out',
  743: 'Improvised border fortifications',
  744: 'Secure border fortifications',
  745: 'Enhanced border fortifications',
  746: 'Border wall',
  747: 'Strong border wall',
  748: 'Castle defense wall',
  749: 'Town wall',
  750: 'Strong town wall',
  751: 'Very strong town wall',
  752: 'Incredibly strong town wall',
  753: 'Totally incredible town wall',
  754: 'Last wall standing',
  755: 'Great Wall of China',
  756: 'Extensive barrier',
  757: 'Gigantic barrier',
  758: 'Megalomaniac barrier',
  759: 'Colossal barrier',
  800: 'Slurp',
  801: 'Digmol',
  802: 'Toothey',
  803: 'Okultacle',
  804: 'Spidor',
  805: 'Jackobu',
  806: 'Shrimpfly',
  807: 'Reaprim',
  808: 'Petdacat',
  809: 'Mykon',
  810: 'Fishorr',
  811: 'Cuckooly',
  812: 'Battlutter',
  813: 'Pinklynx',
  814: 'Pharamumm',
  815: 'Ninstarr',
  816: 'Luchtablong',
  817: 'Angrack',
  818: 'Devilsatt',
  819: 'Poisnake',
  820: 'Shaggyll',
  821: 'Jellclops',
  822: 'Tinck',
  823: 'Cloudning',
  824: 'Nevorfull',
  825: 'Plutoid',
  826: 'Djinntonic',
  827: 'Blaxta',
  828: 'Lampcess',
  829: 'Teslarr',
  830: 'Sunnya',
  831: 'Buckfoxion',
  832: 'Birdychirp',
  833: 'Eyeorwhat',
  834: 'Mesmerit',
  835: 'Antlar',
  836: 'Liphant',
  837: 'Knilight',
  838: 'Heraldon',
  839: 'Unikor',
  840: 'Mamoton',
  841: 'Monkorrage',
  842: 'Smaponyck',
  843: 'Bittnutz',
  844: 'Roarear',
  845: 'Muscudon',
  846: 'Apstick',
  847: 'Horrnington',
  848: 'Boaringg',
  849: 'Mameloth',
  850: 'Rheynooh',
  851: 'Rockastonn',
  852: 'Redwoofox',
  853: 'Lilbeatzup',
  854: 'Forror',
  855: 'Nipprabs',
  856: 'Armoruck',
  857: 'Canocle',
  858: 'Tricerawood',
  859: 'Mouthrexor',
  860: 'Firimp',
  861: 'Gullps',
  862: 'Pyrophibus',
  863: 'Flamechirr',
  864: 'Tectospit',
  865: 'Pyroplant',
  866: 'Kokofire',
  867: 'Peppryon',
  868: 'Boomywoomy',
  869: 'Tikiricky',
  870: 'Matchlit',
  871: 'Birblazey',
  872: 'Infernox',
  873: 'Humbuzzish',
  874: 'Dragopyr',
  875: 'Mantiflame',
  876: 'Finnettle',
  877: 'Etrock',
  878: 'Blazingtongues',
  879: 'Devastor',
  880: 'Goldy',
  881: 'Orcahle',
  882: 'Ocodile',
  883: 'Penguwater',
  884: 'Walrophin',
  885: 'Colsnail',
  886: 'Aquaphant',
  887: 'Naar',
  888: 'Octoboss',
  889: 'Ewilgryn',
  890: 'Seapard',
  891: 'Shellzy',
  892: 'Mingho',
  893: 'Angbite',
  894: 'Mermoid',
  895: 'Watnake',
  896: 'Cannoturtle',
  897: 'Unhere',
  898: 'Tritosting',
  899: 'Hydrospir',
  1100: 'Eloquent Hat',
  1101: 'Sour Argus',
  1102: 'Fluffy Friend',
  1103: 'A. van Blame',
  1104: 'Phony Locky',
  1105: 'Killer Stare',
  1106: 'Bad Kisser',
  1107: 'Guardian of the Golden Egg',
  1108: 'Gentle Giant',
  1109: 'Pedigree Bad Boy',
  1110: 'Unrepentant Penitent',
  1111: 'The Gifted Ones (and Ron)',
  1112: 'Stumbledoor',
  1113: 'Petey Rat',
  1114: 'Diabolical Dolores',
  1115: 'Inconveniently Infinite Inferi',
  1116: 'Bella the Beastly',
  1117: 'Lucius the Pure-Blood',
  1118: 'Cutsie Cuddler',
  1119: 'You Should Know Who...',
  1120: 'Dancing Mushroom',
  1121: 'Deserted City Guard',
  1122: 'Baneful Bartender',
  1123: 'Sepulchral Scammer',
  1124: 'Brutal Blacksmith',
  1125: 'Wily Witch',
  1126: 'Sinister Salesman',
  1127: 'Atrocious Abawuwu',
  1128: 'Skullsplitter Shakes',
  1129: 'Frightening Fidget',
  1130: 'Not So Snappy Dragon',
  1131: 'Golden Dragon with Fiery-Eyed Glance',
  1132: 'Seductive Mother of Drankeys',
  1133: 'Undead Saurian Fossil',
  1134: 'Shenlong',
  1135: 'Baby Dragon',
  1136: 'New Year\'s Dragon',
  1137: 'Pet Out of Control',
  1138: 'Dragon with Concussion',
  1139: 'Annoyed Mother of Dragons',
  1140: 'Cutlery Head',
  1141: 'Conceptual Proof',
  1142: 'Dracula',
  1143: 'Master of Phone Pranks',
  1144: 'Lovable Twins',
  1145: 'Friendly Sewer Clown',
  1146: 'Therapist\'s Doll',
  1147: 'Your Worst Nightmare',
  1148: 'Butcher Next Door',
  1149: 'Tube Girl',
  1150: '1,000 Punch Man',
  1151: 'Mister X-Ray',
  1152: 'Toilet Tracker',
  1153: 'Iron Man',
  1154: 'Rain Man',
  1155: 'Invisible Woman',
  1156: 'Candy Man',
  1157: 'Captain Caffeine',
  1158: 'Forgetful Fist',
  1159: 'Captain Monday',
  1160: 'Magical Schoolgirl',
  1161: 'Master of Doppelgangers',
  1162: 'Friendly Helper from the Neighborhood',
  1163: 'Student Shinigami',
  1164: 'Wannabe Detective',
  1165: 'Rubber Pirate',
  1166: 'Pet Trainer',
  1167: 'Joseph Joker',
  1168: 'Supreme Alien',
  1169: 'Cheating Brat',
  1170: 'Doltopus',
  1171: 'Hairy Groom',
  1172: 'Monster Truck',
  1173: 'Nudist Giant',
  1174: 'Marshmallow Man',
  1175: 'Sandbox Worm',
  1176: 'Optimist Supreme',
  1177: 'Three-headed Dragon God',
  1178: 'Angry Giant Saurian',
  1179: 'Berlin Scene Monster',
  1200: 'Orc on Warg',
  1201: 'Troll Trio',
  1202: 'The King',
  1203: 'Smollum',
  1204: 'Spiders again',
  1205: 'Orc Boss',
  1206: 'Bezog',
  1207: 'Smoulder',
  1208: 'Nazguls...Nazgulses?',
  1209: 'Monster in the Lake',
  1210: 'Valaraukar',
  1211: 'Urcsi the Uruk',
  1212: 'Prompter Splittongue',
  1213: 'Samowar the Pale',
  1214: 'Oliphaunt Tamer',
  1215: 'Undead Army',
  1216: 'Shelantula',
  1217: 'Ruler of the Nine',
  1218: 'Mauron\'s Maw',
  1219: 'The Necromancer',
  1300: 'One-headed Hydra',
  1301: 'Two-headed Hydra',
  1302: 'Three-headed Hydra',
  1303: 'Four-headed Hydra',
  1304: 'Five-headed Hydra',
  1305: 'Six-headed Hydra',
  1306: 'Seven-headed Hydra',
  1307: 'Eight-headed Hydra',
  1308: 'Nine-headed Hydra',
  1309: 'Ten-headed Hydra',
  1310: 'Eleven-headed Hydra',
  1311: 'Twelve-headed Hydra',
  1312: 'Thirteen-headed Hydra',
  1313: 'Fourteen-headed Hydra',
  1314: 'Fifteen-headed Hydra',
  1315: 'Sixteen-headed Hydra',
  1316: 'Seventeen-headed Hydra',
  1317: 'Eighteen-headed Hydra',
  1318: 'Nineteen-headed Hydra',
  1319: 'Countless-headed Hydra',
  1320: 'DoctorBenx',
  1321: 'Zakreble',
  1322: 'Golden Gianpy',
  1323: 'Willyrex',
  1324: 'Alvaro845',
  1325: 'Paul Terra',
  1326: 'Spieletrend',
  1327: 'Fatty Pillow',
  1328: 'Gimper',
  1329: 'Unge',
  1330: 'KeysJore',
  1331: 'Aypierre',
  1332: 'Mandzio',
  1333: 'Boruciak',
  1334: 'Fifqo',
  1335: 'Zsoze',
  1336: 'ZeboPL',
  1337: 'Dhalucard',
  1338: 'Earliboy',
  1339: 'Skate702',
  1340: 'Dorzer',
  1400: 'Heimdall',
  1401: 'Valkyries',
  1402: 'Hel',
  1403: 'Thor',
  1404: 'Odin',
  1405: 'Loki',
  1406: 'Ymir',
  1407: 'Midgard Serpent',
  1408: 'Fenris Wolf',
  1409: 'Surtr',
  1410: 'Singing Sirens',
  1411: 'Polyphemus the Cyclops',
  1412: 'Cerberus',
  1413: 'Medusa',
  1414: 'Athena',
  1415: 'Hercules',
  1416: 'Ares',
  1417: 'Poseidon',
  1418: 'Hades',
  1419: 'Zeus',
  5000: 'Roaming Revenant',
  5001: 'Capricious Corpse',
  5002: 'Undead Fiend',
  5003: 'Fierce Flutter',
  5004: 'Underground Bloodsucker',
  5005: 'Concealed Cave Creature',
  5006: 'Wicked Web Wanderer',
  5007: 'Eight-legged Nightmare',
  5008: 'Poison-Tooth Abomination',
  5009: 'Angry Goblin',
  5010: 'Balgrb the Goblin',
  5011: 'Furious Goblin',
  5012: 'Labbrg the Goblin',
  5013: 'Glarbb the Goblin',
  5014: 'Festive Goblin',
  5015: 'Murderous Orc Rider',
  5016: 'Stabbed Cave Spider',
  5017: 'Hungry Cave Spider',
  5018: 'Dangerous Orc',
  5019: 'Unyielding Orc',
  5020: 'Snappy Orc',
  5021: 'Festive Orc',
  5022: 'Battle-hardened Orc',
  5023: 'Flying Scouts',
  5024: 'Troll without Conscience',
  5025: 'Troll without Remorse',
  5026: 'Unerring Orc',
  5027: 'Radiant Orc Archer',
  5028: 'Merciless Uruk',
  5029: 'Sinister Spear Uruk',
  5030: 'Defender of the Christmas Charm',
  5031: 'Cave Troll',
  5032: 'Ice Troll',
  5033: 'Young Fighter from Afar',
  5034: 'Snooper',
  5035: 'Royal Goblin',
  5036: 'Agorantola',
  5037: 'Mean Easter Bunny',
  5038: 'Choleric Easter Bunny',
  5039: 'Murderous Easter Bunny',
  5040: 'Pink Easter Bunny',
  5041: 'Horrible Easter Bunny',
  5042: 'Poison-green Easter Bunny',
  5043: 'Skunkus Pocus',
  5044: 'Genie',
  5045: 'Harald the Hunk',
  5046: 'Sleeping Bunny',
  5047: 'Armor with Own Life',
  5048: 'Enchanted Armor',
  5049: 'Possessed Armor',
  5050: 'Voracious Tome',
  5051: 'Master\'s Pet Cat',
  5052: 'Cause of Disorder',
  5053: 'Maker of Mess',
  5054: 'Server Of Chaos',
  5055: 'Cause Of Devastation',
  5056: 'Cowardly Rat',
  5057: 'Insidious Rodent',
  5058: 'Sickly Sweet Granny',
  5059: 'Silver-blue-blooded',
  5060: 'Keen Kisser',
  5061: 'Cursed Deceased',
  5062: 'Formerly Dead Corpse',
  5063: 'Partly Living Dead',
  5064: 'Watchful Werewolf',
  5065: 'Gigantic Giant',
  5066: 'Eater of Demise',
  5067: 'Devourer of Dying',
  5068: 'Consumer of Passing',
  5069: 'Muncher of Life\'s End',
  5070: 'Zacharias Zap Zap',
  5071: 'Robinia Raven Tooth',
  5072: 'The Witch of the North North South',
  5073: 'The Little Lord',
  5074: 'Packaging without Content',
  5075: 'Gnome Projectile',
  5076: 'Taxi Real Player',
  5077: 'Trash Collection Real Player',
  5078: 'Living Armor (Bikini Edition)',
  5079: 'Dancing Mushroom',
  5080: 'Deserted City Guard',
  5081: 'Poor Sod',
  5082: 'Cornelius the Choking Hazard',
  5083: 'Evil Elfreda',
  5084: 'Yulamb Bone Crusher',
  5085: 'Dingalf the Destroyer',
  5086: 'Murderous Margrethe',
  5087: 'Reckless Ronan',
  5088: 'Hateful Hydra',
  5089: 'Diabolic Demon',
  5090: 'Defiled Demon',
  5091: 'Grim Goblin',
  5092: 'Gloomy Goblin',
  5093: 'Devious Dark Elf',
  5094: 'Deadly Dark Elf',
  5095: 'Overtly Offensive Orc',
  5096: 'Ominous Orc',
  5097: 'Grumpy Gnome',
  5098: 'Gruesome Gnome',
  5099: 'Demonic Dwarf',
  5100: 'Deceitful Dwarf',
  5101: 'Eerie Elf',
  5102: 'Evil Elf',
  5103: 'Horrible Human',
  5104: 'Heartless Human',
  5105: 'Killing Kokofire',
  5106: 'Cheerless Cuckooly',
  5107: 'Macabre Mantiflame',
  5108: 'Miserable Mesmerit',
  5109: 'Obnoxious Okultacle',
  5110: 'Crushing Cannoturtle',
  5111: 'Provocative Plutoid',
  5112: 'Poisonous Pyrophibus',
  5113: 'Cruel Colsnail',
  5114: 'Savage Spidor',
  5115: 'Raging Rockastonn',
  5116: 'Tyrannical Tricerawood',
  5117: 'Undead Unikor',
  5118: 'Bad Boaringg',
  5119: 'Wrongful Walrophin',
  5120: 'Corrupted Cannonball Creature',
  5121: 'Abysmal Arena Monster',
  5122: 'Ghastly Gold Monster',
  5123: 'Sly Silver Monster',
  5124: 'Angry Axe Assaulter',
  5125: 'Sturdy Swordsman',
  5126: 'Dangerous Druid of Despair',
  5127: 'Dark Druid of Doom',
  5128: 'Brainless Battle Mage',
  5129: 'Bristling Battle Mage',
  5130: 'Mischievous Mage',
  5131: 'Demoralizing Demon Hunter',
  5132: 'Destructive Demon Hunter',
  5133: 'Wrathful Warrior',
  5134: 'Brutal Berserker',
  5135: 'Atrocious Assassin',
  5136: 'Sneaky Scout',
  5137: 'Murderous Mannequin',
  5138: 'Kunigunde the Killer',
  5139: 'Mark the Murderer',
  5140: 'Bert the Bloodthirsty',
  5141: 'Baneful Bartender',
  5142: 'Sepulchral Scammer',
  5143: 'Brutal Blacksmith',
  5144: 'Wily Witch',
  5145: 'Sinister Salesman',
  5146: 'Atrocious Abawuwu',
  5147: 'Skullsplitter Shakes',
  5148: 'Frightening Fidget',
  5149: 'Voracious Chewing Chest',
  5150: 'k_test01.png',
  5151: 'Flying Terror Tube',
  5152: 'Pigs',
  5153: 'Self-proclaimed Bartender',
  5154: 'Flying Chicken',
  5155: 'Thirsty Waiter',
  5156: 'Toilet Cleaning Zombie',
  5157: 'Mop Swinging He-Goat',
  5158: 'Persuader',
  5159: 'Head of Beheadings',
  5160: 'Head of Fun Department',
  5161: 'Meals on Wheels',
  5162: 'Insta Monster',
  5163: 'Unpleasantly Pushy Ice Cream Seller',
  5164: 'Over-committed "Magician"',
  5165: 'Bassist from the Beast Boys',
  5166: 'Bro Buying You a Drink',
  5167: 'Occupational Safety Officer',
  5168: 'Chief Executive Hijacker',
  5169: 'Pretty Cool Party Guest',
  5170: 'Networking Officer',
  5171: 'Feelgood Manager',
  5172: 'Head of Crooked Things',
  5173: 'DJ Silence',
  5174: 'Gourmet Duo',
  5175: 'Telephone Terror Auntie',
  5176: 'Generous Wannabe',
  5177: 'Party Crasher',
  5178: 'Beauty Dancing in a Trance',
  5179: 'Retired Amateur Photographer',
  5180: 'Pretzel Bello',
  5181: 'Singer from the Beast Boys',
  5182: 'Drummer from the Beast Boys',
  5183: 'Amateur Philosopher',
  5184: 'Chef Sir Cookalot',
  5185: 'Toxic Bartender',
  5186: 'John-Cloud van Daemon',
  5187: 'Winner of the Unofficial Eating Contest',
  5188: 'Tipsy Thug',
  5189: 'Bull-necked Waiter',
  5190: 'Trace Remover',
  5191: 'Employee of the Month',
  5192: 'Self-caterer',
  5193: 'Mosh Pit Starter',
  5194: 'Buffet Connoisseur',
  5195: 'Valaraukar',
  5196: 'Aggressive Orc Rider',
  5197: 'Witch King',
  5198: 'Kidnapper of Elves',
  5199: 'Namuras the Inverted',
  5200: 'The Lord of All Things',
  5201: 'Dragon Bat',
  5202: 'Bloodthirsty Dragon Bat',
  5203: 'Classic Christmas Tree',
  5204: 'Modern Christmas Tree',
  5205: 'Shakes from a lost dimension',
  5206: 'Malicious Bartender',
  5207: 'Cookroach',
  5208: 'Unbidden Break Dancer',
  5209: 'Smombie',
  5210: 'Junk Food Junkie',
  5211: 'Party Corpse',
  5212: 'Shot King',
  5213: 'Unpleasant Influencer',
  5214: 'Head of Department for Basic Needs',
  5215: 'Head of Marketing Department',
  5216: 'The Project Manager',
  5217: 'Chief Kidnapping Officer',
  5218: 'Christmas Troll',
  5219: 'Snow Snake',
  5220: 'Wolf Pig',
  5221: 'Puggy Warg',
  5222: 'Orc Glow Nose',
  5223: 'Powdered Orc',
  5224: 'Christmas Party Orc',
  5225: 'Exhausted Screenwriter',
  5226: 'Slim Shadow',
  5227: 'The Not That Strange One',
  5228: 'Father Orc',
  5229: 'Experimental Chef',
  5230: 'Gargling Cauldron',
  5231: 'Ultrasensitive Unicorn Dummy',
  5232: 'One-legged Assistant',
  5233: 'Magical Kitty',
  5234: 'Sharp-tongued Marsh Toad',
  5235: 'Clamoring Mandrake',
  5236: 'Ice-cold Mortician',
  5237: 'Uschi, Contract Mage of the Seas',
  5238: 'Shadow Witch of Crossbows',
  5239: 'Baba Yaga\'s Holiday Hut',
  6000: 'Raging Dark Elf',
  6001: 'Angry Dwarf',
  6002: 'Aggressive Elf',
  6003: 'Enraged Goblin',
  6004: 'Uncomfortable Dyad',
  6005: 'Upset Couple',
  6006: 'Irascible Couple',
  6007: 'Indignant Duo',
  6008: 'Trio with a Fit of Rage',
  6009: 'Angry Mob',
  6010: 'Raging Crowd',
  6011: 'Wrathful Pocket Hero',
  6012: 'Angry Canary',
  6013: 'Little Sweet Tooth',
  6014: 'Eccentric Seductress',
  6015: 'Mischievously-looking Lecher',
  6016: 'Hormonal Orc',
  6017: 'Love-hungry Couple',
  6018: 'Lusty Dyad',
  6019: 'Imposing Swingers',
  6020: 'Lustful Duo of Darkness',
  6021: 'Lewd Trio',
  6022: 'Slippery Squad',
  6023: 'Obscene Supremacy',
  6024: 'Mr. Gray',
  6025: 'Sparkling Lad',
  6026: 'Conspicuously Inconspicuous Dwarf',
  6027: 'Devious Lady',
  6028: 'Trustworthy Fellow',
  6029: 'Sneaky Night Elf',
  6030: 'Insidious Couple',
  6031: 'Treacherous Team',
  6032: 'Perfidious Adversaries',
  6033: 'Suspicious Relationship',
  6034: 'Despicable Creatures',
  6035: 'Brotherhood of Deceit',
  6036: 'Back-stabbing Gang',
  6037: 'Scarred Uncle',
  6038: 'Lucifer',
  6039: 'Deceitful Beach Saleswoman',
  6040: 'Sanctimonious Demoness',
  6041: 'Three-armed Bandit',
  6042: 'Promising Hypocrite',
  6043: 'Tourist Trap',
  6044: 'Immoral Couple',
  6045: 'Pushy Swindlers',
  6046: 'Dastardly Duo',
  6047: 'Suspicious Trio',
  6048: 'Atrocious Rogues',
  6049: 'Ruthless Mob',
  6050: 'Biting Lootbox',
  6051: 'Distrustful Mushroom Dealer',
  6052: 'Decadent Connoisseur',
  6053: 'Sugar Rush Gnome',
  6054: 'Flat Rate Party Orc',
  6055: 'Competition Eater',
  6056: 'Feeding Frenzy Allies',
  6057: 'Glutton Couple',
  6058: 'Voracious Team',
  6059: 'Hyperphagia Friends',
  6060: 'Crapulous Companions',
  6061: 'Unbridled Contemporaries',
  6062: 'Starved Comrades',
  6063: 'Dionysus',
  6064: 'Gluttonous Gaul',
  6065: 'Filterless Natural Beauty',
  6066: 'Power-hungry Regent',
  6067: 'Brutal Broker',
  6068: 'Greedy Gold Diver',
  6069: 'Natural Narcissists',
  6070: 'The Deluded Rich',
  6071: 'Vain Elite',
  6072: 'Ruthless Collectors',
  6073: 'Haughty Hoarders',
  6074: 'Greedy Group',
  6075: 'Powerful Pack',
  6076: 'Crusty Crustacean',
  6077: 'Furry She-Devil'
}