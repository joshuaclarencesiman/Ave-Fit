const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const exerciseDescriptions = {
  "Ab Wheel Rollout": "An anti-extension core exercise that challenges the abdominals and shoulders as you roll the wheel away while keeping your trunk braced.",
  "Arnold Press": "A rotating dumbbell shoulder press that trains the deltoids and triceps through a controlled overhead range.",
  "Assault Bike": "A full-body conditioning interval on an air-resistance bike, using coordinated pushes and pulls with the arms while pedaling.",
  "Back Extension": "A controlled hip-extension exercise that trains the glutes, hamstrings, and spinal erectors without overextending the lower back.",
  "Barbell Curl": "An elbow-flexion exercise that trains the biceps while the upper arms stay close to the torso.",
  "Battle Rope Waves": "A conditioning drill that alternates arm-driven rope waves while the trunk stays braced and the knees remain softly bent.",
  "Bench Dip": "A bodyweight elbow-extension exercise that emphasizes the triceps; use a comfortable shoulder range and avoid sinking deeply.",
  "Bent Over Row": "A hinged pulling exercise that trains the lats and upper back as you draw the weight toward the lower ribs.",
  "Bicycle Crunch": "A trunk-flexion and rotation drill that alternates bringing each shoulder toward the opposite knee while keeping the movement controlled.",
  "Bulgarian Split Squat": "A single-leg squat variation with the rear foot elevated, emphasizing the front-leg quadriceps and glutes.",
  "Cable Crossover": "A cable chest fly that brings the arms together in front of the torso with a soft elbow bend and controlled return.",
  "Cable Crunch": "A kneeling trunk-flexion exercise that uses a cable for resistance while the hips remain mostly fixed.",
  "Cable Curl": "An elbow-flexion exercise performed against cable resistance, emphasizing the biceps through a steady range.",
  "Cable Fly": "A standing cable chest fly that brings the hands together in front of the chest without turning it into a press.",
  "Cable Kickback": "A cable glute exercise that extends the hip while the torso stays stable and the pelvis remains facing forward.",
  "Cable Lateral Raise": "A single-arm cable raise that trains the side deltoid as the arm lifts out to the side with a slight elbow bend.",
  "Calf Raise": "A plantar-flexion exercise that trains the calf muscles by lifting the heels and lowering them with control.",
  "Chest Fly": "A chest isolation movement that arcs the arms inward with softly bent elbows, emphasizing the pectoral muscles.",
  "Clean and Press": "A two-part barbell lift combining a clean to the shoulders and an overhead press; learn the clean with a qualified coach before loading it.",
  "Close Grip Row": "A close-hand horizontal pull that trains the lats and mid-back while the torso stays steady.",
  "Concentration Curl": "A strict single-arm curl performed with the elbow braced against the inner thigh to limit body swing.",
  "Crunch": "A short-range trunk-flexion exercise that curls the shoulders toward the pelvis while keeping the lower back supported.",
  "Decline Bench Press": "A decline-angle chest press that lowers the bar toward the lower chest and presses it back over the shoulders.",
  "Decline Sit Up": "A trunk-flexion exercise performed on a decline bench; use a controlled range and avoid pulling on the neck.",
  "Dip Machine": "A machine-assisted or weighted dip pattern that trains the triceps and chest through a comfortable shoulder range.",
  "Dips": "A bodyweight pressing exercise that trains the triceps and chest; keep the shoulders comfortable and avoid dropping into a deep stretch.",
  "Dragon Flag": "An advanced anti-extension core exercise that lowers and raises the body as a rigid line; use a regression if you cannot keep control.",
  "Dumbbell Bench Press": "A horizontal dumbbell press that trains the chest, triceps, and front shoulders while each arm moves independently.",
  "Dumbbell Curl": "An elbow-flexion exercise that trains the biceps while the torso and upper arms remain still.",
  "Elliptical": "A low-impact cardiovascular exercise that uses a smooth, continuous stride to train aerobic endurance.",
  "Face Pull": "A cable pull toward the face that trains the rear deltoids and upper back with the elbows moving out to the sides.",
  "Front Raise": "A shoulder-flexion exercise that lifts a weight in front of the body to about shoulder height with a slight elbow bend.",
  "Front Squat": "A squat with the load held in front of the shoulders, emphasizing the quadriceps while the torso stays upright.",
  "Glute Bridge": "A floor-based hip-extension exercise that trains the glutes by lifting the hips while keeping the ribs down.",
  "Goblet Squat": "A squat holding one weight close to the chest, training the quadriceps and glutes with an upright torso.",
  "Good Morning": "A loaded hip hinge that trains the hamstrings, glutes, and spinal erectors; begin very light and use coach supervision.",
  "Hack Squat": "A supported squat variation that emphasizes the quadriceps while the back stays against the machine pad.",
  "Hammer Curl": "A neutral-grip curl that trains the brachialis and forearm muscles alongside the biceps.",
  "Hanging Leg Raise": "A hanging trunk and hip-flexion exercise that raises the legs without swinging or arching the lower back.",
  "Hip Thrust": "A loaded hip-extension exercise that trains the glutes by driving the hips upward while maintaining a braced trunk.",
  "Hyperextension": "A back-extension variation that emphasizes controlled hip extension and the glutes, hamstrings, and spinal erectors.",
  "Incline Bench Press": "An incline-angle chest press that emphasizes the upper chest and front shoulders as the bar moves over the upper chest.",
  "Incline Dumbbell Curl": "A dumbbell curl performed on an incline bench, training the biceps from a lengthened starting position.",
  "Jump Rope": "A rhythmic cardiovascular drill using small, relaxed hops and wrist-driven rope turns.",
  "Kettlebell Swing": "A hip-hinge power exercise that drives the kettlebell forward with the hips rather than lifting it with the arms.",
  "Landmine Press": "An angled press that drives a barbell away and upward, training the shoulders and triceps with a forward-reaching path.",
  "Lat Pulldown": "A vertical pulling exercise that brings the bar toward the upper chest by driving the elbows down.",
  "Lateral Raise": "A shoulder isolation exercise that raises the arms out to the sides with a soft elbow bend, emphasizing the side deltoids.",
  "Leg Curl": "A knee-flexion exercise that trains the hamstrings by curling the heels toward the body against resistance.",
  "Leg Extension": "A seated knee-extension exercise that trains the quadriceps by straightening the knees against machine resistance.",
  "Leg Press": "A supported lower-body press that trains the quadriceps and glutes as the platform is pressed away without locking the knees.",
  "Machine Chest Press": "A supported horizontal press that trains the chest, triceps, and front shoulders through a controlled machine path.",
  "Machine Row": "A supported horizontal pull that trains the lats and mid-back while the chest stays against the pad.",
  "Machine Shoulder Press": "A supported overhead press that trains the shoulders and triceps while the back stays against the seat.",
  "Military Press": "A strict standing overhead barbell press that trains the shoulders and triceps while the trunk stays braced.",
  "Mountain Climber": "A plank-position conditioning drill that alternates bringing the knees forward while the shoulders stay over the hands.",
  "One Arm Dumbbell Row": "A unilateral row that trains the lat and upper back as one dumbbell is drawn toward the hip with a steady torso.",
  "Overhead Cable Curl": "A cable curl performed with the upper arms held out to the sides, emphasizing the biceps through elbow flexion.",
  "Overhead Tricep Extension": "An elbow-extension exercise with the arms overhead that trains the triceps through a controlled range.",
  "Pec Deck": "A machine chest fly that brings the upper arms together in front of the chest with a steady, controlled return.",
  "Preacher Curl": "A supported curl that trains the biceps while the upper arms rest against a preacher pad.",
  "Pull-Up": "A vertical bodyweight pull that raises the chest toward a bar using the lats and upper back.",
  "Push-Up": "A horizontal bodyweight press that trains the chest, shoulders, and triceps while the body stays in a straight line.",
  "Rack Pull": "A partial-range deadlift from safety pins that trains the hip extensors and upper back; brace before each controlled lift.",
  "Rear Delt Fly": "A bent-over or supported arm-opening movement that trains the rear deltoids and upper back.",
  "Reverse Curl": "A pronated-grip curl that emphasizes the forearm extensors and brachialis while the elbows stay close to the body.",
  "Reverse Lunge": "A single-leg squat pattern stepping backward, training the front-leg glutes and quadriceps with balance and control.",
  "Reverse Pec Deck": "A reverse machine fly that opens the arms outward to train the rear deltoids and upper back.",
  "Romanian Deadlift": "A hip hinge that lowers the weight along the legs with softly bent knees, emphasizing the hamstrings and glutes.",
  "Rope Pushdown": "A cable elbow-extension exercise that trains the triceps as the rope is pressed down while the upper arms stay by the sides.",
  "Rowing Machine": "A full-body conditioning exercise using a leg drive, torso swing, and arm pull, followed by a controlled return.",
  "Russian Twist": "A seated trunk-rotation exercise that turns the rib cage side to side while maintaining a steady, comfortable posture.",
  "Seated Cable Row": "A horizontal cable pull that trains the lats and mid-back as the handle moves toward the torso without leaning excessively.",
  "Seated Calf Raise": "A seated plantar-flexion exercise that emphasizes the soleus by raising and lowering the heels through a controlled range.",
  "Shoulder Press": "An overhead press that trains the deltoids and triceps; keep the ribs down and press in a comfortable path.",
  "Shrug": "A shoulder-elevation exercise that trains the upper trapezius by lifting the shoulders upward without rolling them.",
  "Side Plank": "An isometric lateral-core exercise that holds the body in a straight line supported on one forearm and the side of the foot or knees.",
  "Single Arm Pushdown": "A single-arm cable elbow extension that trains the triceps while the upper arm remains close to the torso.",
  "Skull Crusher": "A lying elbow-extension exercise that trains the triceps as the weight lowers toward the forehead or just behind the head.",
  "Sled Push": "A loaded conditioning drill that drives a sled forward with short, controlled steps and a braced torso.",
  "Smith Bench Press": "A guided-bar horizontal press that trains the chest and triceps; set the hooks and safety stops before lifting.",
  "Smith Squat": "A squat performed on a guided bar path that trains the quadriceps and glutes through a comfortable depth.",
  "Squat": "A lower-body squat that trains the quadriceps and glutes as the hips and knees bend together and extend to stand.",
  "Stair Climber": "A steady cardiovascular exercise that steps rhythmically on moving stairs while maintaining an upright posture.",
  "Standing Calf Raise": "A standing plantar-flexion exercise that trains the gastrocnemius by lifting the heels and lowering with control.",
  "Sumo Deadlift": "A wide-stance deadlift that lifts the bar from the floor using coordinated knee and hip extension while the trunk stays braced.",
  "T-Bar Row": "A bent-over horizontal row that trains the lats and mid-back as the handle is pulled toward the torso.",
  "Thruster": "A front squat flowing into an overhead press; use a light load to learn the coordinated movement and seek coaching if new to it.",
  "Toe Touch": "A gentle posterior-chain mobility drill that hinges or reaches toward the toes only within a comfortable range.",
  "Trap Bar Deadlift": "A deadlift using a hex bar that trains the glutes, quadriceps, and hamstrings with the load centered around the body.",
  "Treadmill Run": "A treadmill running session for cardiovascular fitness; begin at a manageable pace and use the safety clip.",
  "Tricep Pushdown": "A cable elbow-extension exercise that trains the triceps while the upper arms stay close to the torso.",
  "Upright Row": "An upper-body pull that raises a close-held weight in front of the torso; use a comfortable range and stop if the shoulders hurt.",
  "Walking Lunge": "A traveling single-leg squat that alternates steps, training the glutes and quadriceps while maintaining balance.",
  "Wide Grip Pulldown": "A wide-grip vertical pull that trains the lats as the bar moves toward the upper chest with the elbows driving down.",
  "Wood Chop": "A diagonal cable or band rotation that trains the trunk as the arms move across the body with controlled hip and rib-cage rotation.",
  "Yoga Stretch": "A gentle flexibility session using controlled positions and breathing; stay within a comfortable, pain-free range.",
};

const coachingSteps = {
  "Ab Wheel Rollout": [
    ["Set up", "Kneel on a mat with the wheel under your shoulders. Brace your abdomen and keep your hips gently tucked."],
    ["Roll out", "Slowly roll forward only as far as you can keep your ribs down and lower back from sagging."],
    ["Return", "Pull the wheel back toward your knees using your core. Shorten the range or stop if you feel back pain."],
  ],
  "Assault Bike": [
    ["Set up", "Adjust the seat so your knee remains slightly bent at the bottom of each pedal stroke."],
    ["Work", "Pedal smoothly and push and pull the handles in rhythm. Choose a pace you can control."],
    ["Recover", "Ease the effort gradually and keep moving lightly rather than stopping abruptly after a hard interval."],
  ],
  "Battle Rope Waves": [
    ["Set up", "Hold one rope end in each hand, stand with a stable stance, bend your knees slightly, and brace your trunk."],
    ["Wave", "Alternate lifting and lowering your arms to send continuous waves toward the anchor."],
    ["Finish", "Keep shoulders relaxed and waves controlled. Stop if your grip or shoulder position becomes painful."],
  ],
  "Bench Dip": [
    ["Set up", "Place your hands on a stable bench beside your hips. Keep your shoulders down and feet planted."],
    ["Lower", "Bend your elbows and lower only through a comfortable shoulder range; do not force a deep stretch."],
    ["Press", "Straighten your elbows to return. Stop if you feel shoulder pain or instability."],
  ],
  "Bench Press": [
    ["Set up", "Lie on the bench with eyes under the bar, feet planted, and shoulder blades gently set against the pad."],
    ["Lower", "Unrack with control and lower the bar toward the mid-chest while keeping wrists stacked over elbows."],
    ["Press", "Press the bar up and slightly back over the shoulders. Use a spotter or safety arms for challenging loads."],
  ],
  "Bent Over Row": [
    ["Hinge", "Hold the bar and push your hips back with softly bent knees until your torso is inclined and your back stays neutral."],
    ["Row", "Pull the bar toward your lower ribs with elbows moving behind you; avoid jerking or shrugging."],
    ["Lower", "Extend your arms under control while maintaining the hip hinge and steady trunk."],
  ],
  "Bicycle Crunch": [
    ["Set up", "Lie on your back, brace gently, and bring your knees over your hips without pulling on your neck."],
    ["Alternate", "Bring one shoulder toward the opposite knee as the other leg extends only as far as your back stays comfortable."],
    ["Continue", "Move slowly from side to side and keep the motion controlled rather than swinging your elbows."],
  ],
  "Burpees": [
    ["Squat", "Stand with feet about hip-width apart, then bend your knees and place your hands on the floor."],
    ["Step back", "Step or hop your feet to a plank while keeping your trunk braced; step back in instead of jumping if needed."],
    ["Stand", "Return to standing smoothly. Add a jump only if it is comfortable and you can land softly."],
  ],
  "Cable Fly": [
    ["Set up", "Stand centered between the pulleys with handles in hand, a small staggered stance, and soft elbows."],
    ["Bring together", "Sweep your arms forward in a hugging arc until your hands meet in front of your chest."],
    ["Return", "Open your arms slowly until you feel a comfortable chest stretch; keep the elbow angle steady."],
  ],
  "Cable Kickback": [
    ["Set up", "Attach the cable to your ankle, hold the frame for balance, and brace your torso."],
    ["Extend", "Move the working leg backward from the hip without arching your back or turning your pelvis."],
    ["Return", "Bring the leg forward slowly, keeping tension controlled and range comfortable."],
  ],
  "Calf Raise": [
    ["Set up", "Stand with feet about hip-width apart and hold a stable support if needed."],
    ["Raise", "Lift your heels by pressing through the balls of your feet; pause briefly at the top."],
    ["Lower", "Lower your heels slowly to a comfortable stretch without bouncing."],
  ],
  "Chest Fly": [
    ["Set up", "Lie on a stable bench with weights above your chest, palms facing each other, and elbows softly bent."],
    ["Open", "Lower your arms out to the sides in a wide arc until you feel a comfortable chest stretch."],
    ["Close", "Bring the weights together over your chest without changing the elbow bend or clanging them together."],
  ],
  "Clean and Press": [
    ["Learn the clean", "Practice the pull and catch with a qualified coach using a light training bar before adding weight."],
    ["Rack and brace", "Catch the bar securely at the shoulders, stand tall, and brace your trunk before pressing."],
    ["Press and lower", "Press overhead without leaning back, then return the bar to the shoulders and lower it safely as taught."],
  ],
  "Close Grip Row": [
    ["Set up", "Sit at the row station, hold the close-grip handle, and sit tall with knees softly bent."],
    ["Pull", "Draw the handle toward your lower ribs by moving your elbows back while keeping your torso steady."],
    ["Reach", "Extend your arms forward slowly without rounding or rocking your lower back."],
  ],
  "Crunch": [
    ["Set up", "Lie on your back with knees bent and feet grounded. Rest your hands lightly by your head or across your chest."],
    ["Curl", "Exhale and lift your shoulder blades by drawing your ribs toward your pelvis; do not pull your neck."],
    ["Lower", "Lower your shoulders slowly and keep the movement small and controlled."],
  ],
  "Cycling": [
    ["Adjust", "Set the seat so your knee remains slightly bent when the pedal is at its lowest point."],
    ["Ride", "Pedal smoothly with relaxed shoulders and a pace suitable for your fitness level."],
    ["Cool down", "Reduce resistance and cadence gradually before dismounting safely."],
  ],
  "Decline Bench Press": [
    ["Set up", "Secure your feet in the bench supports and position yourself so the bar is above your chest."],
    ["Lower", "Unrack with a spotter or safety arms ready, then lower toward the lower chest with wrists stacked."],
    ["Press", "Press the bar back over the shoulders without bouncing it off your chest."],
  ],
  "Decline Sit Up": [
    ["Set up", "Secure your feet on the decline bench and cross your arms over your chest or place hands lightly by your temples."],
    ["Lower", "Lean back slowly only as far as you can control without pulling your neck or arching painfully."],
    ["Sit up", "Exhale and curl your torso toward your thighs, then lower with control."],
  ],
  "Dip Machine": [
    ["Set up", "Adjust the seat or assistance so you can control the handles, then set your shoulders comfortably."],
    ["Press", "Straighten your elbows to press the handles down without locking them forcefully."],
    ["Return", "Bend your elbows slowly and stop before your shoulders are pulled into an uncomfortable stretch."],
  ],
  "Dips": [
    ["Set up", "Grip stable parallel bars and support yourself with shoulders comfortable and elbows straight but not jammed."],
    ["Lower", "Bend your elbows and descend only as far as your shoulders remain comfortable and controlled."],
    ["Press", "Push through your hands to return to the top. Use an assisted variation if you cannot control the descent."],
  ],
  "Dragon Flag": [
    ["Set up", "Lie on a stable bench and hold its edge behind your head. Brace your trunk before lifting."],
    ["Lower", "Keep your body aligned and lower only through a range you can control without your lower back sagging."],
    ["Reset", "Return with control or use a tucked-knee regression. This advanced exercise is best learned with a coach."],
  ],
  "Elliptical": [
    ["Set up", "Step on carefully, hold the stationary handles, and choose an easy resistance to start."],
    ["Move", "Use a smooth stride, stand tall, and add the moving handles if comfortable."],
    ["Finish", "Slow down gradually, wait for the pedals to stop, then step off carefully."],
  ],
  "Front Squat": [
    ["Set up", "Rest the bar across the front shoulders with elbows lifted, feet stable, and trunk braced."],
    ["Squat", "Bend hips and knees together, keeping the chest lifted and knees tracking with your toes."],
    ["Stand", "Press through the whole foot to stand. Use a manageable load and secure rack safeties."],
  ],
  "Glute Bridge": [
    ["Set up", "Lie on your back with knees bent and feet flat about hip-width apart."],
    ["Lift", "Brace gently and press through your feet to lift your hips until your body forms a comfortable line from shoulders to knees."],
    ["Lower", "Squeeze your glutes without arching your lower back, then lower your hips slowly."],
  ],
  "Good Morning": [
    ["Set up", "Use a very light bar or a dowel across your upper back, feet stable, and knees softly bent."],
    ["Hinge", "Push your hips backward while keeping your spine neutral and the load close to your center."],
    ["Stand", "Drive your hips forward to stand. Learn the pattern with a coach and stop if your back hurts."],
  ],
  "Hip Thrust": [
    ["Set up", "Rest your upper back against a stable bench, place feet flat, and position padding under any bar across your hips."],
    ["Drive", "Brace your trunk and press through your feet to lift your hips until your torso is near level."],
    ["Lower", "Keep ribs down at the top, then lower your hips under control without bouncing."],
  ],
  "Incline Bench Press": [
    ["Set up", "Set a modest incline, plant your feet, and position the bar over your upper chest with a spotter or safeties."],
    ["Lower", "Lower the bar toward the upper chest with forearms near vertical and wrists straight."],
    ["Press", "Press up and slightly back over the shoulders, maintaining contact with the bench."],
  ],
  "Lateral Raise": [
    ["Set up", "Stand tall with a light weight at your sides, elbows softly bent, and shoulders relaxed."],
    ["Raise", "Lift your arms out to the sides to a comfortable height around shoulder level without swinging."],
    ["Lower", "Lower slowly and keep your neck relaxed throughout the movement."],
  ],
  "Leg Curl": [
    ["Set up", "Adjust the machine pivot to align with your knee and place the pad comfortably above your heels."],
    ["Curl", "Bend your knees to bring your heels toward you while keeping your hips against the support."],
    ["Return", "Straighten your knees slowly without letting the weight stack slam."],
  ],
  "Machine Chest Press": [
    ["Set up", "Adjust the seat so the handles line up around mid-chest, then set your back against the pad."],
    ["Press", "Push the handles forward smoothly without locking your elbows or lifting your shoulders."],
    ["Return", "Bring the handles back slowly until you feel a comfortable chest stretch."],
  ],
  "Military Press": [
    ["Set up", "Hold the bar at upper-chest height, feet stable, glutes and abdomen gently braced."],
    ["Press", "Press the bar overhead while keeping ribs down and moving your head clear of the bar path."],
    ["Lower", "Bring the bar back to the shoulders under control. Use a rack and a load you can safely manage."],
  ],
  "Mountain Climber": [
    ["Set up", "Start in a high plank with hands under shoulders, legs extended, and body in a straight line."],
    ["Drive", "Bring one knee toward your chest without lifting or twisting your hips, then return the foot."],
    ["Alternate", "Switch legs at a controlled pace; slow down or elevate your hands if your form changes."],
  ],
  "Mountain Climbers": [
    ["Set up", "Start in a high plank with hands under shoulders and trunk braced."],
    ["Alternate", "Bring one knee forward, return it, and then switch sides while keeping hips steady."],
    ["Scale", "Choose a steady pace or step each foot in turn. Stop if you cannot maintain a comfortable plank."],
  ],
  "One Arm Dumbbell Row": [
    ["Set up", "Support one hand and knee on a bench, keep your back neutral, and hold the dumbbell below your shoulder."],
    ["Row", "Pull the dumbbell toward your hip with your elbow close to your side, avoiding torso rotation."],
    ["Lower", "Extend your arm slowly while keeping your shoulders and trunk stable."],
  ],
  "Overhead Cable Curl": [
    ["Set up", "Stand between high pulleys, take the handles, and position your upper arms out to the sides."],
    ["Curl", "Bend your elbows to bring your hands toward your head while keeping upper arms steady."],
    ["Extend", "Straighten your elbows slowly without letting the cables pull your shoulders forward."],
  ],
  "Overhead Tricep Extension": [
    ["Set up", "Hold a light dumbbell or cable handle overhead with elbows bent and upper arms near your ears."],
    ["Extend", "Straighten your elbows to raise the weight while keeping ribs down and shoulders comfortable."],
    ["Lower", "Bend your elbows slowly to return the weight behind your head within a pain-free range."],
  ],
  "Pec Deck": [
    ["Set up", "Adjust the seat so the handles or pads align with your chest and your elbows remain softly bent."],
    ["Close", "Bring your arms together in front of your chest without shrugging or forcing the range."],
    ["Open", "Return slowly until you feel a comfortable stretch; keep your back against the pad."],
  ],
  "Plank": [
    ["Set up", "Place forearms on the floor with elbows under shoulders and legs extended; use knees down as a regression."],
    ["Brace", "Keep your head, trunk, and hips in a straight line and breathe steadily."],
    ["Hold", "Stop the set when your hips sag, rise, or your lower back becomes uncomfortable."],
  ],
  "Pull Ups": [
    ["Set up", "Grip a secure overhead bar and hang with shoulders engaged; use an assisted variation if needed."],
    ["Pull", "Draw your elbows down and lift your chest toward the bar without kicking or swinging."],
    ["Lower", "Descend under control to a comfortable arm extension while keeping your shoulders active."],
  ],
  "Push-Up": [
    ["Set up", "Place hands just wider than shoulders and form a straight line from head to heels; elevate hands to scale."],
    ["Lower", "Bend your elbows and lower your chest with your trunk braced and elbows angled comfortably."],
    ["Press", "Push the floor away to return to the top without letting your hips sag."],
  ],
  "Reverse Curl": [
    ["Set up", "Hold a light bar or dumbbells with palms facing down and wrists straight."],
    ["Curl", "Bend your elbows to raise the weight while keeping upper arms near your sides."],
    ["Lower", "Lower slowly without swinging or bending your wrists."],
  ],
  "Reverse Lunge": [
    ["Set up", "Stand tall with feet hip-width apart and hands at your sides or on a stable support."],
    ["Step back", "Take a comfortable step backward and bend both knees, keeping the front knee aligned over the foot."],
    ["Return", "Push through the front foot to stand and bring the rear foot forward. Alternate sides with control."],
  ],
  "Running": [
    ["Prepare", "Choose a route and pace appropriate to your current fitness. Begin with an easy walk or jog to warm up."],
    ["Run", "Use relaxed shoulders and a comfortable stride; slow to a walk if you cannot speak comfortably."],
    ["Cool down", "Reduce your pace gradually and walk briefly before stopping."],
  ],
  "Shoulder Press": [
    ["Set up", "Use a stable standing or seated position with weights at shoulder height and trunk gently braced."],
    ["Press", "Press overhead in a comfortable path without flaring your ribs or shrugging."],
    ["Lower", "Return the weights to shoulder height under control. Reduce range or load if uncomfortable."],
  ],
  "Shrug": [
    ["Set up", "Stand tall holding manageable weights at your sides with arms relaxed."],
    ["Lift", "Raise your shoulders straight toward your ears without rolling them or bending your elbows."],
    ["Lower", "Pause briefly, then lower your shoulders slowly to the start."],
  ],
  "Side Plank": [
    ["Set up", "Lie on one side and place your elbow under your shoulder; bend your knees to make an easier version."],
    ["Lift", "Raise your hips until your body forms a straight line from shoulders to hips and knees or feet."],
    ["Hold", "Breathe steadily and stop when your hips drop or your shoulder becomes uncomfortable. Repeat on the other side."],
  ],
  "Single Arm Pushdown": [
    ["Set up", "Stand at a cable with a single handle, elbow tucked near your side, and wrist neutral."],
    ["Press", "Straighten your elbow to move the handle down without leaning or rotating your torso."],
    ["Return", "Bend your elbow slowly to the start while keeping the upper arm steady; repeat on the other side."],
  ],
  "Smith Bench Press": [
    ["Set up", "Set the bench and safety stops so the bar can be caught safely, then lie with feet planted."],
    ["Lower", "Unlock the bar and lower toward your mid-chest with wrists stacked over elbows."],
    ["Press", "Press smoothly and re-engage the hooks when the set is complete; do not rely on the machine instead of safeties."],
  ],
  "Smith Squat": [
    ["Set up", "Position yourself under the Smith bar with feet stable and safeties set just below your comfortable squat depth."],
    ["Squat", "Bend your hips and knees while keeping your torso braced and knees tracking with your toes."],
    ["Stand", "Press through your feet to stand and rotate the bar into its hooks before stepping away."],
  ],
  "Squat": [
    ["Set up", "Stand with feet around shoulder-width, toes slightly turned out, and trunk braced."],
    ["Lower", "Bend hips and knees together, keeping your heels grounded and knees tracking with your toes."],
    ["Stand", "Press through the whole foot to stand. Use a comfortable depth and avoid pain."],
  ],
  "Squats": [
    ["Set up", "Stand with feet around shoulder-width and brace your trunk."],
    ["Lower", "Bend your hips and knees, keeping heels down and knees aligned with your toes."],
    ["Stand", "Press through your feet to return upright with control."],
  ],
  "Thruster": [
    ["Set up", "Hold a light bar or dumbbells at shoulder height with feet stable and trunk braced."],
    ["Squat and drive", "Lower into a controlled squat, then stand smoothly and use that momentum to press overhead."],
    ["Return", "Lower the weights to your shoulders with control. Learn the coordinated pattern with a coach if new to it."],
  ],
  "Toe Touch": [
    ["Set up", "Stand comfortably with knees soft, or sit with legs extended if that is the version assigned."],
    ["Reach", "Hinge or reach toward your toes only as far as you can without pain or bouncing."],
    ["Return", "Come back upright slowly and breathe normally; keep the stretch gentle."],
  ],
  "Trap Bar Deadlift": [
    ["Set up", "Stand centered in the trap bar, hinge down to the handles, and brace your trunk with a neutral spine."],
    ["Lift", "Push through the floor and stand by extending hips and knees together; keep the bar close."],
    ["Lower", "Send hips back and bend knees to lower the bar quietly. Start with a manageable load."],
  ],
  "Treadmill Run": [
    ["Set up", "Stand on the side rails to start the treadmill, attach the safety clip, then step onto the belt at a slow pace."],
    ["Run", "Increase speed gradually and run at a pace you can control without holding the rails."],
    ["Stop", "Reduce speed to a walk before stopping the belt, then step onto the side rails."],
  ],
  "Tricep Pushdown": [
    ["Set up", "Stand at a high cable with elbows tucked near your sides and shoulders relaxed."],
    ["Press", "Straighten your elbows to press the handle down while keeping your upper arms still."],
    ["Return", "Bend your elbows slowly to the start without letting the stack pull your shoulders forward."],
  ],
  "Wide Grip Pulldown": [
    ["Set up", "Sit with thighs secured under the pads and take a wide, comfortable overhand grip."],
    ["Pull", "Draw your elbows down and bring the bar toward your upper chest without leaning far back."],
    ["Return", "Let your arms extend slowly while keeping control of the cable and shoulders."],
  ],
  "Wood Chop": [
    ["Set up", "Stand sideways to a cable or band with feet stable and hands holding the handle."],
    ["Rotate", "Move your arms diagonally across your body with controlled trunk rotation; do not yank with your lower back."],
    ["Return", "Reverse the path slowly and repeat, then turn around to train the other side."],
  ],
  "Yoga Stretch": [
    ["Breathe", "Move into each assigned stretch slowly and breathe normally."],
    ["Hold gently", "Stay in a comfortable stretch without bouncing or forcing the joint range."],
    ["Stop if painful", "Ease out of any position that causes sharp pain, numbness, or dizziness."],
  ],
};

const descriptionByName = new Map(
  Object.entries(exerciseDescriptions).map(([name, description]) => [normalize(name), description])
);
const stepsByName = new Map(
  Object.entries(coachingSteps).map(([name, steps]) => [
    normalize(name),
    steps.map(([title, description]) => ({ title, description })),
  ])
);

const stepAliases = {
  "ab machine crunch": "crunch",
  "assault bike intervals": "assault bike",
  "assisted pull up machine": "pull ups",
  "barbell bent over row": "bent over row",
  "barbell clean and press": "clean and press",
  "barbell front squat": "front squat",
  "barbell hip thrust": "hip thrust",
  "barbell shrug": "shrug",
  "barbell thruster": "thruster",
  "battle rope slam": "battle rope waves",
  "battle ropes": "battle rope waves",
  "cable crossover": "cable fly",
  "cable face pull": "face pull",
  "cable glute kickback": "cable kickback",
  "cable lateral raise": "lateral raise",
  "cable rope hammer curl": "hammer curl",
  "cable woodchopper": "wood chop",
  "chest press machine": "machine chest press",
  "close grip bench press": "bench press",
  "close grip lat pulldown": "wide grip pulldown",
  "decline barbell bench press": "decline bench press",
  "decline bench sit up": "decline sit up",
  "dips triceps focus": "dips",
  "dumbbell flyes": "chest fly",
  "dumbbell lateral raise": "lateral raise",
  "dumbbell overhead triceps extension": "overhead tricep extension",
  "dumbbell shrug": "shrug",
  "dumbbell single arm row": "one arm dumbbell row",
  "elliptical trainer": "elliptical",
  "glute bridge machine": "glute bridge",
  "incline barbell bench press": "incline bench press",
  "incline dumbbell flyes": "chest fly",
  "kettlebell goblet squat": "goblet squat",
  "landmine rotation": "wood chop",
  "low to high cable fly": "cable fly",
  "lying leg curl": "leg curl",
  "machine bicep curl": "preacher curl",
  "machine shoulder press": "shoulder press",
  "machine triceps extension": "tricep pushdown",
  "overhead cable triceps extension": "overhead tricep extension",
  "pec deck machine": "pec deck",
  "reverse pec deck": "pec deck",
  "rope pushdown": "tricep pushdown",
  "seated leg curl": "leg curl",
  "smith machine bench press": "smith bench press",
  "smith machine shoulder press": "shoulder press",
  "smith machine squat": "smith squat",
  "stationary bike": "cycling",
  "straight arm pulldown": "wide grip pulldown",
  "treadmill incline walk": "treadmill run",
  "weighted dips chest focus": "dips",
  "weighted plank": "plank",
};

const hasGenericSteps = (steps) => {
  if (!Array.isArray(steps)) return false;
  const text = steps.map((step) => step?.description || "").join(" ").toLowerCase();
  return [
    "adjust the seat/pads to fit your body",
    "perform the movement slowly and with control",
    "squeezing the target muscles at the peak of the motion",
    "load the barbell with an appropriate weight",
    "one fluid, controlled motion",
    "maintaining tension and control rather than letting the weight drop",
    "rather than stopping abruptly",
    "position yourself as designed",
    "with a weight you can control with good form",
    "move through the full range of the exercise",
    "perform the primary motion",
    "target muscles (",
    "set up with the sled",
    "position your body at the equipment",
  ].some((phrase) => text.includes(phrase));
};

const createSteps = (first, second, third) => [
  { title: "Set up", description: first },
  { title: "Move with control", description: second },
  { title: "Return safely", description: third },
];

function exerciseSpecificFallback(name) {
  if (/assisted pull.?up/i.test(name)) {
    return createSteps(
      "Choose enough counterweight to control the movement. Position yourself on the machine as designed and grip the bar.",
      "Pull your chest toward the bar by driving your elbows down while keeping your torso steady.",
      "Lower slowly until your arms are comfortably extended, then let the platform rise under control."
    );
  }
  if (/captain.?s chair|knee raise|leg raise/i.test(name)) {
    return createSteps(
      "Set your forearms or hands securely on the supports and let your legs hang without swinging.",
      "Brace your abdomen and lift your knees or legs only as high as you can without arching your back.",
      "Lower slowly to the start and reset your body before the next repetition."
    );
  }
  if (/hip abduction/i.test(name)) {
    return createSteps(
      "Sit with your back supported and knees against the pads; choose a comfortable starting range.",
      "Press your knees outward smoothly without leaning or bouncing.",
      "Bring your knees together slowly while keeping tension on the machine."
    );
  }
  if (/hip adduction/i.test(name)) {
    return createSteps(
      "Sit with your back supported and the inner-thigh pads set to a comfortable starting width.",
      "Squeeze your legs inward smoothly without bouncing or shifting your pelvis.",
      "Allow your legs to open slowly until you feel a comfortable stretch."
    );
  }
  if (/box jump/i.test(name)) {
    return createSteps(
      "Choose a low, stable box with clear space around it. Stand close enough to land fully on top.",
      "Bend your hips and knees, swing your arms, and jump with a quiet, balanced landing.",
      "Stand tall on the box, then step down one foot at a time. Avoid jumping down; stop if you cannot land in control."
    );
  }
  if (/farmer.?s carry/i.test(name)) {
    return createSteps(
      "Pick up two manageable weights with a hip hinge and stand tall with shoulders relaxed.",
      "Walk with short, steady steps, an upright torso, and the weights held at your sides.",
      "Stop in a clear area and set the weights down by hinging at your hips and bending your knees."
    );
  }
  if (/cable pull.?through/i.test(name)) {
    return createSteps(
      "Face away from a low cable, hold the rope between your legs, and step forward until the cable is taut.",
      "Hinge your hips back with a neutral spine, then drive your hips forward to stand; keep your arms relaxed.",
      "Send your hips back again under control. Do not turn the movement into a squat or lean backward at the top."
    );
  }
  if (/bulgarian split squat/i.test(name)) {
    return createSteps(
      "Stand a comfortable stride in front of a low, stable bench and rest the top of your rear foot on it; hold support if needed.",
      "Bend the front knee and hip to lower straight down while keeping the front knee aligned with your foot.",
      "Press through the whole front foot to stand. Use a shallow range or bodyweight until balance is steady, then switch sides."
    );
  }
  if (/goblet squat/i.test(name)) {
    return createSteps(
      "Hold one light dumbbell or kettlebell close to your chest with feet in a stable stance.",
      "Bend your hips and knees, keeping the weight close and knees tracking with your toes.",
      "Press through the whole foot to stand while keeping your torso braced."
    );
  }
  if (/sissy squat/i.test(name)) {
    return createSteps(
      "Use the machine or a stable support and begin with a shallow, comfortable range.",
      "Keep your hips extended as your knees bend and your body leans back as one line; do not force the knee range.",
      "Extend your knees smoothly to return. Stop if you feel knee pain or cannot stay supported."
    );
  }
  if (/front raise/i.test(name)) {
    return createSteps(
      "Stand tall with light weights in front of your thighs, elbows softly bent, and shoulders relaxed.",
      "Raise your arms in front to a comfortable height near shoulder level without swinging or leaning back.",
      "Lower slowly to the start and keep your neck relaxed."
    );
  }
  if (/leg extension/i.test(name)) {
    return createSteps(
      "Adjust the seat so the machine pivot aligns with your knee and the pad rests comfortably above your ankles.",
      "Straighten your knees smoothly, stopping before forcefully locking them out.",
      "Bend your knees slowly to lower the pad without letting the weight stack drop."
    );
  }
  if (/medicine ball slam/i.test(name)) {
    return createSteps(
      "Choose a slam-safe ball and clear the area. Stand with feet stable and hold the ball in front of you.",
      "Lift the ball only as high as comfortable, brace, then hinge and drive it down in front of your feet.",
      "Pick up the ball with a hip hinge and bent knees; do not catch a bouncing ball unexpectedly."
    );
  }
  if (/rack pull/i.test(name)) {
    return createSteps(
      "Set the bar on secure rack pins at the height assigned by your coach, stand close, and brace before lifting.",
      "Push through the floor and stand by extending hips and knees while keeping the bar close and spine neutral.",
      "Hinge your hips back and lower the bar quietly onto the pins. Reset your brace between repetitions."
    );
  }
  if (/sled push/i.test(name)) {
    return createSteps(
      "Load the sled lightly at first, grip the handles, and set a stable forward-leaning stance.",
      "Drive the sled with short, steady steps while keeping your trunk braced and shoulders stable.",
      "Slow down in a clear area and release the handles only after the sled is fully stopped."
    );
  }
  if (/sled pull/i.test(name)) {
    return createSteps(
      "Attach the rope or harness securely, choose a manageable load, and create a clear path behind you.",
      "Walk backward with short, controlled steps, keeping your torso upright and the rope under steady tension.",
      "Slow to a stop before releasing the rope; keep other people clear of the sled path."
    );
  }
  if (/clean|snatch|push press|thruster/i.test(name)) {
    return createSteps(
      "Learn the position and timing with a qualified coach using a light training implement before adding load.",
      "Brace your trunk and move the weight using the coached sequence; keep it close and avoid pulling with a rounded back.",
      "Receive and lower the weight only as practiced. Stop if you cannot control the catch or overhead position."
    );
  }
  if (/rowing machine|rowing$/i.test(name)) {
    return createSteps(
      "Set the foot straps securely and sit tall with arms extended, knees bent, and shoulders relaxed.",
      "Drive with your legs first, then swing your torso slightly and draw the handle toward your lower ribs.",
      "Recover in reverse order: extend your arms, hinge forward, then bend your knees and slide toward the start."
    );
  }
  if (/bike|cycling/i.test(name)) {
    return createSteps(
      "Adjust the seat so your knee remains slightly bent at the bottom of the pedal stroke.",
      "Pedal smoothly at a manageable pace with relaxed shoulders and steady breathing.",
      "Reduce effort gradually, wait for moving parts to slow, then dismount carefully."
    );
  }
  if (/stair climber/i.test(name)) {
    return createSteps(
      "Step onto the machine carefully and begin at a slow setting while holding the rails for balance.",
      "Step rhythmically with an upright posture; use the rails only for light balance support.",
      "Slow the machine before stepping off. Stop if you feel unsteady or dizzy."
    );
  }
  if (/jump rope/i.test(name)) {
    return createSteps(
      "Hold the handles lightly with the rope behind you and elbows close to your sides.",
      "Turn the rope with your wrists and use small, relaxed hops, landing softly on the balls of your feet.",
      "Keep the pace comfortable and stop if your landings become heavy or coordination breaks down."
    );
  }
  if (/battle rope/i.test(name)) {
    return createSteps(
      "Hold one rope end in each hand, stand in a stable athletic stance, and brace your trunk.",
      "Create alternating or simultaneous waves with your arms while keeping shoulders relaxed and knees soft.",
      "Maintain a controllable rhythm, then ease off and set the ropes down safely."
    );
  }
  if (/treadmill|running|incline walk/i.test(name)) {
    return createSteps(
      "Start the treadmill while standing on the side rails and attach the safety clip before stepping on.",
      "Begin at a comfortable pace and increase speed or incline gradually; avoid holding the rails while moving.",
      "Reduce speed to an easy walk before stopping the belt and stepping onto the side rails."
    );
  }
  if (/elliptical/i.test(name)) {
    return createSteps(
      "Step onto the pedals carefully, hold the stationary handles, and start with an easy resistance.",
      "Use a smooth stride and upright posture; add the moving handles only if comfortable.",
      "Slow down gradually, wait for the pedals to stop, then step off carefully."
    );
  }
  if (/plank|crunch|sit.?up|ab wheel|dragon flag|russian twist|toe touch|wood ?chop/i.test(name)) {
    return createSteps(
      "Set a stable position for the exercise and gently brace your abdomen before moving.",
      "Perform the named trunk movement slowly through a comfortable range while keeping your lower back controlled.",
      "Return to the start without bouncing or pulling on your neck. Stop if you feel sharp pain or lose control."
    );
  }
  if (/squat|lunge|step.?up|leg press|sissy/i.test(name)) {
    return createSteps(
      "Set your feet in a stable stance, brace your trunk, and use a support if balance requires it.",
      "Bend your hips and knees in the exercise's direction of travel, keeping knees aligned with your toes and heels grounded.",
      "Press through the working foot to return smoothly. Use a comfortable depth and stop if painful."
    );
  }
  if (/deadlift|romanian|good morning|hinge|back extension|hyperextension|hip thrust|glute bridge|swing/i.test(name)) {
    return createSteps(
      "Set your feet securely and brace your trunk; begin with a light load and a neutral back position.",
      "Move from the hips as the exercise requires, keeping the load close and avoiding excessive lower-back arching.",
      "Return to standing or the starting position with control. Stop if you feel back pain or cannot maintain your position."
    );
  }
  if (/calf raise/i.test(name)) {
    return createSteps(
      "Position your feet securely with the balls of your feet supported and heels free to move.",
      "Lift your heels by pressing through the balls of your feet and pause briefly at the top.",
      "Lower your heels slowly through a comfortable range without bouncing."
    );
  }
  if (/curl/i.test(name)) {
    return createSteps(
      "Hold the handle or weight with wrists neutral and elbows positioned as the exercise requires.",
      "Bend your elbows to curl the resistance without swinging your torso or moving the upper arms unnecessarily.",
      "Straighten your elbows slowly to return, keeping control of the resistance."
    );
  }
  if (/push.?down|tricep|skull crusher|kickback/i.test(name)) {
    return createSteps(
      "Set your shoulders comfortably and position your elbows for the exercise; start with a manageable load.",
      "Straighten your elbows to move the resistance while keeping your upper arms steady.",
      "Bend your elbows slowly to return without letting the cable or weight pull you out of position."
    );
  }
  if (/fly|pec deck|rear delt/i.test(name)) {
    return createSteps(
      "Set the bench or machine so your shoulders are supported and keep a slight bend in your elbows.",
      "Move your arms through a controlled arc for the chest or rear-shoulder fly, without turning it into a press.",
      "Return slowly until you reach a comfortable stretch; do not force your shoulders behind your body."
    );
  }
  if (/row|pulldown|pull.?up|chin.?up|face pull/i.test(name)) {
    return createSteps(
      "Set your stance or seat securely, take the handle, and brace your trunk with shoulders relaxed.",
      "Pull by driving your elbows in the exercise's direction, keeping your torso steady rather than swinging.",
      "Extend your arms slowly to return while maintaining control of the cable or weight."
    );
  }
  if (/press|dip|push.?up/i.test(name)) {
    return createSteps(
      "Set your feet or seat securely and position the hands or handles at a comfortable pressing height.",
      "Press the resistance away while keeping wrists aligned, trunk braced, and shoulders comfortable.",
      "Bend your elbows slowly to return. Use a lighter load or easier variation if you cannot control the motion."
    );
  }
  return null;
}

const isGenericDescription = (description) => /^builds? .+ strength\.?$/i.test(String(description || "").trim());

function enrichExercise(exercise) {
  const key = normalize(exercise.exercise_name);
  const description = descriptionByName.get(key);
  const coaching = stepsByName.get(key) || (stepAliases[key] ? stepsByName.get(normalize(stepAliases[key])) : null);
  const movementSteps = coaching && (!Array.isArray(exercise.movement_steps) || exercise.movement_steps.length === 0 || hasGenericSteps(exercise.movement_steps))
    ? coaching
    : hasGenericSteps(exercise.movement_steps)
    ? exerciseSpecificFallback(exercise.exercise_name)
    : null;

  return {
    ...exercise,
    ...(description && isGenericDescription(exercise.description) ? { description } : {}),
    ...(movementSteps
      ? { movement_steps: movementSteps }
      : {}),
  };
}

module.exports = enrichExercise;
