import Empirica from "meteor/empirica:core";
import "./bots.js";
import "./callbacks.js";
const glob = require('glob');

// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.

const generateScenesObject = require('./generateScenes');

Empirica.gameInit(game => {
  game.players.forEach((player, i) => {
    player.set("avatar", `/avatars/jdenticon/${player._id}`);
    player.set("score", 0);
  });

  const gameLength = game.treatment.length;

  let scenes = _.shuffle(generateScenesObject.generateScenes());
  _.times(gameLength, i => {
    let scene = scenes.pop();
    console.log(scene);
    let images = [{name: scene.TargetItem, id: 1}, {name: scene.alt1Name, id: 2}, {name: scene.alt2Name, id: 3}, {name: scene.alt3Name, id: 4}, {name: scene.alt4Name, id: 5}]
    images = images.filter(image => image.name !== "IGNORE")

    const target = {name: scene.TargetItem, id: 1}

    const round = game.addRound({
      data: {
        target: target,
        images: images,
        speakerImages: _.shuffle(images),
        listenerImages: _.shuffle(images),
        stage: 'selection'
      }
    });
    round.addStage({
      name: "response",
      displayName: "Task",
      durationInSeconds: 240,
    });
    // round.addStage({
    //   name: "feedback",
    //   displayName: "Feedback",
    //   durationInSeconds: 3,
    // });
  });

  game.set('length', gameLength)

});
