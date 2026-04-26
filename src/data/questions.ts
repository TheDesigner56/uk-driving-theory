import { Question, FlashCard, HazardScenario } from '../types';

export const QUESTIONS: Question[] = [
  // === ALERTNESS ===
  {
    id: 'q01', text: 'You are feeling tired while driving. What should you do?',
    options: ['Open the window for fresh air', 'Turn up the radio', 'Stop in a safe place and rest', 'Drink coffee while driving'],
    correctIndex: 2, category: 'alertness', difficulty: 2,
    explanation: 'Opening the window or turning up the radio only provide short-term relief. The only safe option is to stop in a safe place and rest.',
  },
  {
    id: 'q02', text: 'What effect can drinking alcohol have on your driving?',
    options: ['Improves your reaction time', 'Reduces your concentration and reaction time', 'Makes you more aware of hazards', 'Has no effect if you eat before drinking'],
    correctIndex: 1, category: 'alertness', difficulty: 1,
    explanation: 'Alcohol reduces concentration, slows reaction time, and affects judgement. Even small amounts can impair driving ability.',
  },
  {
    id: 'q03', text: 'You are about to drive after taking medicine that may cause drowsiness. What should you do?',
    options: ['Check the medicine label for driving warnings', 'Take a double dose to make it work faster', 'Drive slowly and hope for the best', 'Only drive if you have a passenger'],
    correctIndex: 0, category: 'alertness', difficulty: 1,
    explanation: 'Many medicines can cause drowsiness. Always check the label for warnings about driving or operating machinery.',
  },
  {
    id: 'q04', text: 'What is the legal alcohol limit for drivers in the UK?',
    options: ['80mg per 100ml of blood', '50mg per 100ml of blood', '100mg per 100ml of blood', 'There is no legal limit'],
    correctIndex: 0, category: 'alertness', difficulty: 3,
    explanation: 'The legal limit in England, Wales and Northern Ireland is 80mg of alcohol per 100ml of blood. In Scotland the limit is 50mg/100ml.',
  },
  {
    id: 'q05', text: 'Driver fatigue is most likely to affect you on which type of road?',
    options: ['Busy city roads', 'Motorways or long straight roads', 'Country lanes', 'Residential streets'],
    correctIndex: 1, category: 'alertness', difficulty: 2,
    explanation: 'Long, straight roads with little variation, such as motorways, can cause boredom and fatigue. Take regular breaks every 2 hours.',
  },
  // === ATTITUDE ===
  {
    id: 'q06', text: 'What should you do when you see a horse rider ahead?',
    options: ['Sound your horn to warn them', 'Speed past quickly', 'Slow down and pass wide and slow', 'Flash your headlights'],
    correctIndex: 2, category: 'attitude', difficulty: 1,
    explanation: 'Horses can be easily startled. Slow down, pass wide (at least 2 metres), and avoid sudden noises or revving the engine.',
  },
  {
    id: 'q07', text: 'What does it mean if another driver flashes their headlights at you?',
    options: ['They are telling you to hurry up', 'They may be warning you of a hazard ahead', 'They want you to pull over', 'They are angry with you'],
    correctIndex: 1, category: 'attitude', difficulty: 2,
    explanation: 'Flashing headlights is used to warn other road users of your presence or a hazard ahead. Never assume it means anything else.',
  },
  {
    id: 'q08', text: 'You are driving behind a large lorry. What is the main danger?',
    options: ['The lorry might brake suddenly', 'Your view of the road ahead is restricted', 'The lorry is going too slowly', 'The lorry might swerve'],
    correctIndex: 1, category: 'attitude', difficulty: 2,
    explanation: 'Large vehicles block your view of the road ahead. Maintain a safe following distance so you can see around the vehicle and react to hazards.',
  },
  {
    id: 'q09', text: 'What should you do if you see a pedestrian with a white stick?',
    options: ['Sound your horn to alert them', 'Slow down and be prepared to stop', 'Speed up to pass quickly', 'Ignore them as they will not cross'],
    correctIndex: 1, category: 'attitude', difficulty: 1,
    explanation: 'A white stick indicates a blind or partially sighted pedestrian. They may not see or hear you approaching. Slow down and be ready to stop.',
  },
  {
    id: 'q10', text: 'What does the term \'road rage\' refer to?',
    options: ['Racing on public roads', 'Aggressive or angry driving behaviour', 'Driving at high speed', 'Ignoring traffic signs'],
    correctIndex: 1, category: 'attitude', difficulty: 1,
    explanation: 'Road rage involves aggressive behaviour such as shouting, making gestures, or deliberately driving dangerously. Stay calm and avoid confrontation.',
  },
  // === SAFETY ===
  {
    id: 'q11', text: 'When should you check your blind spot?',
    options: ['Only when reversing', 'Before changing lanes or turning', 'Every time you stop', 'Only on motorways'],
    correctIndex: 1, category: 'safety', difficulty: 1,
    explanation: 'Your blind spot is an area not visible in your mirrors. Always check it by looking over your shoulder before changing lanes, turning, or merging.',
  },
  {
    id: 'q12', text: 'What is the minimum tread depth for car tyres in the UK?',
    options: ['1.0mm across the centre three-quarters', '1.6mm across the centre three-quarters', '2.0mm across the entire tyre', '0.5mm across the centre three-quarters'],
    correctIndex: 1, category: 'safety', difficulty: 3,
    explanation: 'The legal minimum tread depth is 1.6mm across the centre three-quarters of the tyre around its entire circumference.',
  },
  {
    id: 'q13', text: 'What should you do if your vehicle starts to skid?',
    options: ['Brake hard immediately', 'Steer into the skid and ease off the accelerator', 'Accelerate to regain control', 'Turn the steering wheel sharply'],
    correctIndex: 1, category: 'safety', difficulty: 3,
    explanation: 'If you skid, ease off the accelerator and steer gently in the direction you want the front of the car to go. Do not brake harshly.',
  },
  {
    id: 'q14', text: 'When may you use hazard warning lights while driving?',
    options: ['When parking on double yellow lines', 'When you have broken down or need to warn others of a hazard', 'When driving in heavy rain', 'When you are approaching a junction'],
    correctIndex: 1, category: 'safety', difficulty: 2,
    explanation: 'Hazard warning lights should be used to warn others when your vehicle is causing a temporary obstruction or there is a hazard ahead.',
  },
  {
    id: 'q15', text: 'What should the driver of the following vehicle do in a traffic queue?',
    options: ['Keep as close as possible to the car ahead', 'Leave enough space to see the rear wheels of the vehicle in front', 'Sound the horn repeatedly', 'Drive on the pavement to pass the queue'],
    correctIndex: 1, category: 'safety', difficulty: 2,
    explanation: 'Leave enough space so you can see the rear wheels of the vehicle in front. This allows room to manoeuvre if the vehicle breaks down or to let emergengy vehicles pass.',
  },
  // === ROAD & TRAFFIC SIGNS ===
  {
    id: 'q16', text: 'What does a circular red and white sign with a red border mean?',
    options: ['Information', 'Warning', 'An instruction or prohibition', 'Direction guidance'],
    correctIndex: 2, category: 'roadSigns', difficulty: 2,
    explanation: 'Circular signs with red borders give orders or prohibitions. They tell you what you must or must not do. Triangular signs warn of hazards.',
    imageRef: 'no_entry',
  },
  {
    id: 'q17', text: 'What does a triangular sign with a red border mean?',
    options: ['A warning of a hazard ahead', 'A direction sign', 'An information sign', 'A motorway sign'],
    correctIndex: 0, category: 'roadSigns', difficulty: 1,
    explanation: 'Triangular signs with red borders warn you of hazards or dangers ahead. They are always warning signs.',
  },
  {
    id: 'q18', text: 'What does a blue circular sign with a white arrow mean?',
    options: ['No entry', 'Direction to a car park', 'Minimum speed limit', 'Turn left only'],
    correctIndex: 3, category: 'roadSigns', difficulty: 3,
    explanation: 'Blue circular signs give positive instructions. A white arrow on a blue circle means you must turn in the direction shown.',
    imageRef: 'turn_left',
  },
  {
    id: 'q19', text: 'What does a white sign with a red cross over a number mean?',
    options: ['Speed camera ahead', 'End of speed limit', 'No stopping', 'Clearway - no stopping at any time'],
    correctIndex: 3, category: 'roadSigns', difficulty: 3,
    explanation: 'A white sign with a red diagonal cross means a clearway. No stopping is permitted on the road at any time.',
  },
  {
    id: 'q20', text: 'What does a sign showing a picture of a school and children mean?',
    options: ['School zone - children may be crossing', 'There is a school nearby', 'Children are playing in the area', 'All of the above'],
    correctIndex: 0, category: 'roadSigns', difficulty: 1,
    explanation: 'This warning sign alerts drivers that they are approaching a school zone where children may be crossing the road. Reduce speed and be prepared to stop.',
    imageRef: 'school',
  },
  // === RULES OF THE ROAD ===
  {
    id: 'q21', text: 'What is the national speed limit for a car on a dual carriageway?',
    options: ['60 mph', '70 mph', '50 mph', '80 mph'],
    correctIndex: 1, category: 'rules', difficulty: 2,
    explanation: 'The national speed limit for cars on a dual carriageway is 70 mph unless signs indicate otherwise.',
  },
  {
    id: 'q22', text: 'What is the national speed limit for a car on a single carriageway?',
    options: ['60 mph', '70 mph', '50 mph', '40 mph'],
    correctIndex: 0, category: 'rules', difficulty: 2,
    explanation: 'The national speed limit for cars on a single carriageway is 60 mph unless signs indicate otherwise.',
  },
  {
    id: 'q23', text: 'You see a STOP sign at a junction. What must you do?',
    options: ['Slow down and proceed with caution', 'Stop only if there is traffic approaching', 'Come to a complete stop at the line', 'Give way to traffic from the right only'],
    correctIndex: 2, category: 'rules', difficulty: 1,
    explanation: 'A STOP sign means you must come to a complete stop at the stop line, regardless of whether there is other traffic.',
  },
  {
    id: 'q24', text: 'What does a broken white line in the centre of the road mean?',
    options: ['You must not cross it', 'You may cross it if the road is clear ahead', 'It marks a cycle lane', 'It shows where to park'],
    correctIndex: 1, category: 'rules', difficulty: 2,
    explanation: 'A broken white line in the centre of the road means you may cross it to overtake or change direction if the road ahead is clear.',
  },
  {
    id: 'q25', text: 'What does a double white line in the centre of the road mean?',
    options: ['You may cross if the line nearest to you is broken', 'You must never cross the lines', 'It marks a bus lane', 'It indicates a pedestrian crossing ahead'],
    correctIndex: 0, category: 'rules', difficulty: 3,
    explanation: 'With double white lines, you may only cross the lines if the line nearest to you is broken and it is safe to do so.',
  },
  // === DOCUMENTS ===
  {
    id: 'q26', text: 'How often must you renew your driving licence photo?',
    options: ['Every 5 years', 'Every 10 years', 'Every 15 years', 'Never - it lasts a lifetime'],
    correctIndex: 1, category: 'documents', difficulty: 3,
    explanation: 'Your driving licence photocard must be renewed every 10 years. You can do this online or by post.',
  },
  {
    id: 'q27', text: 'When must you have valid motor insurance?',
    options: ['Only on motorways', 'At all times when the vehicle is on a public road', 'Only when carrying passengers', 'Only at night'],
    correctIndex: 1, category: 'documents', difficulty: 1,
    explanation: 'It is a legal requirement to have at least third-party insurance at all times when your vehicle is used on a public road.',
  },
  {
    id: 'q28', text: 'What does an MOT test check?',
    options: ['The driver\'s eyesight', 'The roadworthiness and safety of the vehicle', 'The vehicle\'s entertainment system', 'The driver\'s knowledge of the Highway Code'],
    correctIndex: 1, category: 'documents', difficulty: 1,
    explanation: 'An MOT test checks that your vehicle meets road safety and environmental standards. It is required annually for vehicles over 3 years old.',
  },
  // === ACCIDENTS ===
  {
    id: 'q29', text: 'What should you do first if you are involved in a collision?',
    options: ['Exchange insurance details', 'Stop and check if anyone is injured', 'Move the vehicles to the side of the road', 'Call your insurance company'],
    correctIndex: 1, category: 'accidents', difficulty: 1,
    explanation: 'The priority after any collision is safety. Stop, check for injuries, and warn other traffic before exchanging details.',
  },
  {
    id: 'q30', text: 'When must you stop after a collision?',
    options: ['Only if someone is injured', 'Only if there is damage to another vehicle', 'You must always stop, regardless of damage', 'Only if the police tell you to stop'],
    correctIndex: 2, category: 'accidents', difficulty: 2,
    explanation: 'You MUST stop after any collision, even if there appears to be no damage or injury. Failure to stop is an offence.',
  },
  {
    id: 'q31', text: 'What information must you give to someone involved in a collision?',
    options: ['Your name and address only', 'Your name, address, and vehicle registration number', 'Your driving test date', 'Your place of work'],
    correctIndex: 1, category: 'accidents', difficulty: 2,
    explanation: 'You must give your name, address, and vehicle registration number to anyone who has reasonable grounds for requiring them.',
  },
  // === MOTORWAY RULES ===
  {
    id: 'q32', text: 'What is the speed limit for a car towing a caravan on a motorway?',
    options: ['50 mph', '60 mph', '70 mph', '55 mph'],
    correctIndex: 1, category: 'motorway', difficulty: 3,
    explanation: 'When towing a caravan or trailer on a motorway, the speed limit is 60 mph (50 mph on single carriageways).',
  },
  {
    id: 'q33', text: 'What colour are motorway direction signs?',
    options: ['Green with white letters', 'Blue with white letters', 'White with black letters', 'Brown with white letters'],
    correctIndex: 1, category: 'motorway', difficulty: 1,
    explanation: 'Motorway signs are blue with white lettering. Primary route signs are green with white letters. Tourist attractions are brown.',
  },
  {
    id: 'q34', text: 'Where should you stop if your vehicle breaks down on a motorway?',
    options: ['In the left-hand lane with hazard lights on', 'On the hard shoulder as far left as possible', 'In the middle of the central reservation', 'Anywhere as long as you have hazard lights on'],
    correctIndex: 1, category: 'motorway', difficulty: 2,
    explanation: 'If your vehicle breaks down on a motorway, pull onto the hard shoulder as far to the left as possible, switch on hazard warning lights, and exit the vehicle on the passenger side.',
  },
  // === HAZARD AWARENESS ===
  {
    id: 'q35', text: 'What is a \'developing hazard\' in the hazard perception test?',
    options: ['A hazard that has already happened', 'Something that may cause you to change speed or direction', 'A road sign warning of danger', 'A broken-down vehicle on the hard shoulder'],
    correctIndex: 1, category: 'hazard', difficulty: 2,
    explanation: 'A developing hazard is something that may cause you to take action, such as changing speed or direction. Spotting it early scores higher points.',
  },
  {
    id: 'q36', text: 'What should you do when approaching a junction with limited visibility?',
    options: ['Speed up to get through quickly', 'Sound your horn continuously', 'Stop, look both ways, and proceed when safe', 'Close your eyes and hope for the best'],
    correctIndex: 2, category: 'hazard', difficulty: 1,
    explanation: 'If your view is obstructed at a junction, stop even if the road appears clear, then look both ways before emerging.',
  },
  {
    id: 'q37', text: 'What should you do if you see a pedestrian step onto a pedestrian crossing?',
    options: ['Speed up to pass before they cross', 'Sound your horn to warn them', 'Slow down and be prepared to stop', 'Flash your lights to let them cross'],
    correctIndex: 2, category: 'hazard', difficulty: 1,
    explanation: 'You must give way to pedestrians on a zebra crossing once they have stepped onto it. Slow down and be prepared to stop.',
  },
  // === SAFETY & YOUR VEHICLE ===
  {
    id: 'q38', text: 'When should you check your tyre pressure?',
    options: ['Once a year', 'Before long journeys and at least once a month', 'Only when the tyre looks flat', 'Every time you fill up with fuel'],
    correctIndex: 1, category: 'vehicle', difficulty: 2,
    explanation: 'Check tyre pressures at least once a month and before long journeys. Incorrect pressures affect handling, braking, and fuel efficiency.',
  },
  {
    id: 'q39', text: 'What does the warning light for the engine management system indicate?',
    options: ['The engine is overheating', 'A fault has been detected in the engine or emissions system', 'The oil needs changing', 'The battery is low'],
    correctIndex: 1, category: 'vehicle', difficulty: 3,
    explanation: 'The engine management warning light indicates a fault detected by the vehicle\'s onboard diagnostics. Have the vehicle checked as soon as possible.',
  },
  {
    id: 'q40', text: 'How often should you check your engine oil level?',
    options: ['Only when the oil light comes on', 'Every week or before a long journey', 'Only at the annual service', 'Every day before driving'],
    correctIndex: 1, category: 'vehicle', difficulty: 2,
    explanation: 'Check your engine oil level regularly (at least every week or before long journeys) to ensure proper lubrication of the engine.',
  },
  // === SAFETY MARGINS ===
  {
    id: 'q41', text: 'What is the typical stopping distance at 50 mph?',
    options: ['43 metres (14 car lengths)', '53 metres (18 car lengths)', '73 metres (24 car lengths)', '36 metres (12 car lengths)'],
    correctIndex: 1, category: 'margins', difficulty: 4,
    explanation: 'At 50 mph, typical stopping distance is 53 metres (about 18 car lengths). The distance increases significantly with speed.',
  },
  {
    id: 'q42', text: 'What is the overall stopping distance at 60 mph?',
    options: ['53 metres (18 car lengths)', '73 metres (24 car lengths)', '96 metres (31 car lengths)', '40 metres (13 car lengths)'],
    correctIndex: 1, category: 'margins', difficulty: 4,
    explanation: 'Overall stopping distance at 60 mph is 73 metres (about 24 car lengths). This includes thinking distance of 18 metres and braking distance of 55 metres.',
  },
  {
    id: 'q43', text: 'In wet conditions, your stopping distance is at least how many times greater?',
    options: ['The same as in dry conditions', 'Double', 'Triple', 'Ten times'],
    correctIndex: 1, category: 'margins', difficulty: 2,
    explanation: 'In wet conditions, your stopping distance is at least double that in dry conditions. In icy conditions, it can be up to ten times greater.',
  },
  // === VEHICLE HANDLING ===
  {
    id: 'q44', text: 'What should you do if your vehicle\'s brakes become wet and less effective?',
    options: ['Continue driving normally', 'Test the brakes gently to dry them', 'Pull over and wait for them to dry', 'Use the handbrake instead'],
    correctIndex: 1, category: 'handling', difficulty: 3,
    explanation: 'After driving through deep water, gently apply the brakes to dry them. Test them at low speed before you need to use them in an emergency.',
  },
  {
    id: 'q45', text: 'What is the effect of under-inflated tyres?',
    options: ['Better fuel economy', 'Increased braking distance and reduced grip', 'Smoother ride quality', 'Faster acceleration'],
    correctIndex: 1, category: 'handling', difficulty: 2,
    explanation: 'Under-inflated tyres reduce grip, increase braking distance, and can cause the vehicle to pull to one side. They also increase fuel consumption.',
  },
  // === VEHICLE LOADING ===
  {
    id: 'q46', text: 'When loading a roof rack, where should the heaviest items be placed?',
    options: ['On the top of the load', 'At the back of the roof', 'Evenly distributed and as low as possible', 'It does not matter as long as everything is tied down'],
    correctIndex: 2, category: 'loading', difficulty: 3,
    explanation: 'Heavy items should be distributed evenly and placed as low as possible to maintain the vehicle\'s stability and handling.',
  },
  {
    id: 'q47', text: 'What is the maximum distance your load can project from the side of your car?',
    options: ['It must not project from the side', 'Up to 30 cm', 'Up to 50 cm', 'Up to 100 cm'],
    correctIndex: 0, category: 'loading', difficulty: 4,
    explanation: 'Loads must not project from the side of the vehicle. They can project up to 2 metres from the rear, but must be marked with a red flag or light.',
  },
  // === OTHER TYPES OF VEHICLE ===
  {
    id: 'q48', text: 'Why should you be extra careful around large goods vehicles?',
    options: ['They can stop more quickly than cars', 'They have large blind spots and need more room to manoeuvre', 'They always have priority on the road', 'They are not allowed on motorways'],
    correctIndex: 1, category: 'loading', difficulty: 2,
    explanation: 'Large goods vehicles have significant blind spots and require more space for turning and stopping. Avoid driving alongside them and ensure you can see the driver in their mirror.',
  },
  // === VULNERABLE ROAD USERS ===
  {
    id: 'q49', text: 'When overtaking a cyclist, how much space should you leave?',
    options: ['At least 0.5 metres', 'At least 1.5 metres', 'At least 3 metres', 'As much space as any other vehicle'],
    correctIndex: 1, category: 'vulnerable', difficulty: 2,
    explanation: 'Give cyclists at least 1.5 metres of space when overtaking at speeds up to 30 mph, and more space at higher speeds. This is now a legal requirement.',
  },
  {
    id: 'q50', text: 'What should you do when approaching a group of pedestrians on a narrow road?',
    options: ['Sound your horn to make them move', 'Speed past quickly', 'Slow down and be prepared to stop', 'Drive close to them to create pressure'],
    correctIndex: 2, category: 'vulnerable', difficulty: 1,
    explanation: 'Be patient with pedestrians on narrow roads. Slow down and be prepared to stop. Do not rev your engine or sound your horn aggressively.',
  },
  {
    id: 'q51', text: 'What does a sign showing a picture of ducks or animals mean?',
    options: ['Farm animals may be in the road ahead', 'There is a zoo ahead', 'Wild animals may cross the road ahead', 'You must stop for any animals'],
    correctIndex: 2, category: 'vulnerable', difficulty: 1,
    explanation: 'Animal warning signs indicate that wild animals (such as deer, horses, or ducks) may cross the road. Reduce speed and be alert.',
    imageRef: 'animals',
  },
  {
    id: 'q52', text: 'What should you do if a bus is pulling out from a bus stop?',
    options: ['Speed up to pass before they move out', 'Flash your lights to tell them to wait', 'Slow down and give way if safe to do so', 'Sound your horn to assert your right of way'],
    correctIndex: 2, category: 'attitude', difficulty: 2,
    explanation: 'Buses need extra room to pull out. If safe, slow down and give way. Be aware that pedestrians may cross in front of the bus.',
  },
  {
    id: 'q53', text: 'What is a contraflow bus lane?',
    options: ['A bus lane that flows in the opposite direction to other traffic', 'A bus lane that is only for bendy buses', 'A bus lane that goes around a roundabout', 'A bus lane that only operates at certain times'],
    correctIndex: 0, category: 'rules', difficulty: 4,
    explanation: 'A contraflow bus lane allows buses to travel in the opposite direction to the general flow of traffic. Be very careful not to enter it.',
  },
  {
    id: 'q54', text: 'What should you do if you are driving at night and a vehicle with one headlight approaches?',
    options: ['Flash your lights to warn them', 'Slow down and be aware they may be misjudging distance', 'Speed up to pass quickly', 'Ignore it as it is not your concern'],
    correctIndex: 1, category: 'alertness', difficulty: 3,
    explanation: 'A vehicle with only one headlight may make it difficult for them to judge distance and position correctly. Slow down and be cautious.',
  },
  {
    id: 'q55', text: 'What is the two-second rule?',
    options: ['The time it takes to brake at 30 mph', 'A minimum following distance in good conditions', 'How long you should wait at a junction', 'The time limit for overtaking'],
    correctIndex: 1, category: 'margins', difficulty: 2,
    explanation: 'The two-second rule helps you maintain a safe following distance. Pick a stationary object ahead and ensure at least 2 seconds pass before you reach it. Double this in wet conditions.',
  },
];