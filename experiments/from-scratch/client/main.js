import Empirica from "meteor/empirica:core";
import { render } from "react-dom";
import ExitSurvey from "./exit/ExitSurvey";
import Thanks from "./exit/Thanks";
// import About from "./game/About";
import Round from "./game/Round";
import Consent from "./intro/Consent";
import InstructionStepOne from "./intro/InstructionStepOne";
import InstructionStepTwo from "./intro/InstructionStepTwo";
import InstructionStepThree from "./intro/InstructionStepThree";
import customBreadCrumb from "./game/Breadcrumb.jsx";
import customGameLobby from "./game/GameLobby.jsx";
import customWaitingForServer from "./game/WaitingForServer.jsx";
import Quiz from "./intro/Quiz";
import Quiz_rtl from "./intro/Quiz_rtl";
import newPlayer_hardcode from "./intro/newPlayer_hardcode.jsx";

// Set the About Component you want to use for the About dialog (optional).
// Empirica.about(About);

// Set the Consent Component you want to present players (optional).
// Empirica.consent(Consent);
// Empirica.consent((game) => { return Consent});
// Empirica.consent(Consent);

// Introduction pages to show before they play the game (optional).
// At this point they have been assigned a treatment. You can return
// different instruction steps depending on the assigned treatment.

Empirica.introSteps((game, treatment) => {
	const steps = [Consent, InstructionStepOne];
	if (treatment.playerCount > 1) {
		steps.push(InstructionStepTwo, InstructionStepThree);
	}
	if (game.treatment.gameLanguage == "Arabic") {
		steps.push(Quiz_rtl);
	} else {
		steps.push(Quiz);
	}
	return steps;
});

// The Round component containing the game UI logic.
// This is where you will be doing the most development.
// See client/game/Round.jsx to learn more.
Empirica.round(Round);

Empirica.newPlayer(newPlayer_hardcode);

// End of Game pages. These may vary depending on player or game information.
// For example we can show the score of the user, or we can show them a
// different message if they actually could not participate the game (timed
// out), etc.
// The last step will be the last page shown to user and will be shown to the
// user if they come back to the website.
// If you don't return anything, or do not define this function, a default
// exit screen will be shown.
Empirica.exitSteps((game, player) => {
	// const steps = [];
	// if (game.treatment.gameLanguage == "Arabic") {
	// 	steps.push(ExitSurvey_rtl);
	// } else {
	// 	steps.push(ExitSurvey);
	// }
	// steps.push(Thanks);
	return [ExitSurvey, Thanks];
});

Empirica.breadcrumb(customBreadCrumb);

Empirica.lobby(customGameLobby);

Empirica.waiting(customWaitingForServer);

// Start the app render tree.
// NB: This must be called after any other Empirica calls (Empirica.round(),
// Empirica.introSteps(), ...).
// It is required and usually does not need changing.
Meteor.startup(() => {
	render(Empirica.routes(), document.getElementById("app"));
});
