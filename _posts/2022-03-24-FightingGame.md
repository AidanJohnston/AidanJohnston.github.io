---
layout: post
title: Deep Reinforcement Learning in Video Games
tags: C# Python Reinforcement-Learning Unity Game
---
Final Degree Project. Implementation of a fighting game in Unity.  Trained agents in-game using self-play reinforcement learning.

<iframe src="https://www.youtube.com/embed/YAg_ZtsFGCA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
# Introduction

For this project, we implemented a fighting game in unity and trained it using reinforcement learning.


# Designing the Game State Machine

The game state machine handles each match and determines who wins.  The game state machine is managed by the GameManager which is described in more detail later on in this document.  Figure 1 shows the state machine for a match.
- Matches
    - Players fight a series of rounds in a match
    - Players play a set of matches until one player has a certain amount of points, i.e. 3, 5, 7.
    - When a player wins a round they are awarded a point
- Rounds
    - A round consists of players attacking each other trying to lower the enemies HP to zero.
    - If a player's HP is brought to zero they lose the round.
- Timers
    - Round go for a set amount of time, i.e. 90 seconds.
    - If the timer runs out, the player with the most HP wins the round
    - If the HP of both players is the same, it is a draw and both players are awarded a point

<p align="center">
<img src="/assets/img/fight/image26.png">
</p>
<p align="center">
Figure 1: Game state machine.
</p>

# Designing Attacks and Animations
## Planning Attacks
Figure 2.1 shows concept drawing for attacks animations, and their hitboxes.  These attacks have been drawn during their active frames; when their damaging hitboxes will be active.  Red boxes represent the active hitboxes and blue show hurtboxes. Figure 2.2 shows the attack motion for reference when animating.

<p align="center">
<img src="/assets/img/fight/image8.png">
</p>
<p align="center">
Figure 2.1: Hitboxes for attacks.

</p>
<p align="center">
<img src="/assets/img/fight/image25.png">
</p>
<p align="center">
Figure 1: Player attack motion and hitboxes
</p>
## Animating
Using the attack motion references, a variety of attacks were animated.  Animation involves defining the location, rotation, and scale of the model's bones at a certain period of time.  Keyframes are used to define these times.  Blender then interpolates the change between keyframes and fills in the gaps.

<p align="center">
<img src="/assets/img/fight/image23.gif">
</p>
<p align="center">
Figure 3: Setting Keyframes and animating in unity
</p>

After each animation was created, they were pushed into the Non-linear-Animator (NLA) for the blender model.  The NLA allows for multiple animations to be stored on a single object 

## Importing into Unity
To export the model, and its animation to Unity, the blender model was saved as an .fbx file.  The .fbx file allows for all the model textures, rigging, and animation to be exported and configured in unity.  The animations are then extracted and applied to separate states on the player's animation state machine.

<p align="center">
<img src="/assets/img/fight/image29.png">
</p>
<p align="center">
Figure 4: Importing animations into Unity
</p>


## Attack Frame Data
For each attack, it has damage, guard type, startup frames, active frames, recovery frames, on hit difference, and on block difference.  Their values are described in table 1.  The attack class is described later on in more depth.

|     Input    |  Damage  | Guard | Startup | Active | Recovery | onBlock | onHit |
|:------------:|:--------:|:-----:|:-------:|:------:|:--------:|:-------:|:-----:|
|     Cross    |    21    |  All  |    7    |    6   |    10    |    -6   |   -5  |
|   MultiKick  | 6x3 (18) |  All  |    5    |   20   |     6    |    +1   |   +2  |
|     Kick     |    16    |  All  |    7    |    6   |     5    |    -5   |   -3  |
|     Knee     |    15    |  All  |    5    |    5   |     5    |    -2   |   +3  |
|     Check    |    13    |  All  |    16   |    5   |     7    |    +3   |   +4  |
|      Jab     |     7    |  All  |    5    |    3   |     7    |    -1   |   +2  |
|     Upper    |    17    |  All  |    6    |    3   |     4    |    -2   |   -4  |
|   SweepKick  |    11    |  Low  |    13   |    4   |    10    |    -5   |   -4  |
| CrouchingJab |    10    |  Low  |    5    |    3   |     7    |    -1   |   +2  |

# Designing the Player State Machine
The Player is controlled by an IInputManager, these inputs feed into their state machine which dictates which animations are played, what direction they move, and if impulses should be applied.  IInputManager is discussed more in depth later on.  Our state machine is controlled mainly by triggers, which are “boolean-like”.  Triggers, when activated will switch to a TRUE state but will automatically switch FALSE when a state changes, this allows for us to “set and forget” each state's triggers.  Our player is capable of jumping, standing still (idle), blocking, crouching, dashing, walking, and attacking.  When a player inputs an attack command as an input, that attack information is updated in the attack node.  Things like animation clips, and attack damage are updated to reflect the current attack. 

<p align="center">
<img src="/assets/img/fight/image7.png">
</p>
<p align="center">
<img src="/assets/img/fight/state.gif">
</p>
<p align="center">
Figure 5: The Player State Machine
</p>



# Hitboxes
Each player has a set of hitboxes attached to them.  They include the hitboxes, hurtboxes, pushboxes.

## Hitbox
The hitbox is the collider which allows the player to attack the other players.  There are several hitbox colliders connected to different sections of the player's model.  When the player moves, the hitboxes move with them.  By default all the players' hitboxes are disabled.  When a player attacks, a set of specific hitboxes are triggered for the duration of the active frames of the attack.

<p align="center">
<img src="/assets/img/fight/image32.png">
</p>
<p align="center">
Figure 5: The Player State Machine
</p>

## Hurtbox
The hurtbox is the collider which allows the player to take damage.  If an active hitbox collides with a hurtboxes, the attacking player sends a signal to the getting hit player that they have been hit along with information about the hit, ie, how much damage, the angle of the attack, the amount of knockback force to apply.

## Pushbox
The pushbox on each player acts as their interaction with the physics of the game.  The pushbox allows the player to receive gravity, and collide with other pushboxes.  In short this stops the player from falling through the floor, and stops the player from overlapping with other players.


<p align="center">
<img src="/assets/img/fight/image33.png">
<img src="/assets/img/fight/image20.png">
<img src="/assets/img/fight/image28.png">
</p>
<p align="center">
Figure 6: Left to right, pushbox, hurtbox, hitbox
</p>
# Class Diagrams

## IInputManager
IInputManager
The goal of IInputManager is to standardize the players inputs, whether they are being controlled by an AI or a human.  IInputManager requires all input managers to implement the method GetInputInstances(), which returns a list of InputInstances.  When the player creates an instance of any input manager, they can call the GetInputInstances() to get a standardized list of inputed buttons, a different input manager can be implemented for different inputs such as game controllers, or in our case, a deep learning backend.  Figure 7 shows the implementation of the IInputManager.  Here we show InputManager, and BlankInputManager.  InputManager is a generic input manager which reads from the keyboard, BlankInputManager on the other hand, always returns a list of empty InputInstances.  BlankInputManager is useful for testing.

<p align="center">
<img src="/assets/img/fight/image27.png">
</p>
<p align="center">
Figure 7: Class diagram for IInputManager
</p>

## Player
The Player class is in charge of managing the players state machine, updating the players velocity, triggering animations, and checking hitboxes.  The Player class extends the MonoBehavior class, unity’s default class.  This allows access to several useful functions, such as Start(), which is called before the first frame update and Update() which is called once per frame.  LateUpdate() is called once per frame like Update() but waits until all Update() functions across all objects which implement MonoBehavior have finished.  This lets us grab the players input in the Update() function call of the players IInputManager and then update our players statemachine in LateUpdate().  This allows us to read inputs to the frame they are active in.  Figure 8 shows the class diagram for Player.

## Attack
The Attacks class extends the ScriptableObject class (a base Unity class), which allows us to create a serializable version of the Attack class and save them in our project.  This is useful for creating multiple versions of Attack for each attack and then giving them to players.  Each player has a list of attacks.  This lets us create unique characters with very little hassle.  The Attack class is shown in figure 8.

<p align="center">
<img src="/assets/img/fight/image12.png">
</p>
<p align="center">
Figure 8: Class diagram for Player and Attack
</p>

## GameManager
The GameManager class handles the game state machine, which determines who wins the round, and game.  The GameManager is also responsible for the GUI, and whether to draw it or not.  GameManager extends MonoBehavior so that it can call functions like Start()  and Update().  Figure 9 shows the class diagram for GameManager.

<p align="center">
<img src="/assets/img/fight/image14.png">
</p>
<p align="center">
Figure 9: Class diagram for PGame Manager
</p>


# Reinforcement Learning

## An overview of PPO
The Proximal Policy Optimization Model (PPO) is a form of the Actor / Critic(A2C/A3C) family.  The main difference between PPO and A2C/A3C is the fact that PPO updates its actor indirectly versus A2C/A3C which updates its actor model directly. The lifecycle of the model consists of the environment (the game) existing in a particular state.  This state is passed to the critical model, the actor model and the intrinsic curiosity model. The Critic model uses the state to output an estimator of advantage.  This estimator of advantage is used in the PPO LCLIP function to produce a loss. This loss is used to update the actor model through gradient accent. 

<p align="center">
<img src="/assets/img/fight/image19.png">
</p>
<p align="center">
Figure 9: Overview of the PPO Model
</p>

The actor model then outputs an action which causes the environment to produce an extrinsic reward, and change in environment state.

## ELO
ELO is the method used for tracking the skill change for our policy. ELO was originally used in competitive chess to track the skill ratings of their players. ELO consists of two main equations, one for calculating the expected score gained or lost during a match, and the other for updating each player's total ELO.

Ea=11+10(Rb-Ra)/400
Sa=1 if Win, 0 if Lose
R'a=Ra+k(Sa+Ea)

After each match the most recent policy ELO is updated. Every 20,000 training steps the most recent policy and its ELO are placed into a model buffer.  This buffer is used for sampling matches for intrinsic training later.

## Agent Input
The agent's inputs, or the environment state are a collection of 32 values.  Note types such as Vector2 get broken down into two floats:
- Agent Position : Vector2
- Enemy Position : Vector2
- Distance to left wall : float
- Distance to right wall : float
- Agent Health : int
- Enemy Health : int
- Enemy Input : IInputInstance
- Agent State : PlayerState
- Enemy State : PlayerState
The agent is passed the current game state and the previous five game states as a stack.
<p align="center">
<img src="/assets/img/fight/image11.png">
</p>
<p align="center">
Figure 10: The agents inputs
</p>

## Agent Output
In total when controlling the player in the game there are seven different buttons to press.  Up, down, left, right, attack1, attack2, and block.
The agent outputs five continuous variables between -1 and 1.  These values are used to determine the buttons pressed for the agent.  Because a float value cant directly be used to determine if a button has been pressed, we used thresholds for determining if the agent wanted to press the button.  The values for up and down, and left and right were used from the same continuous output; you can’t move left and right at the same time. 

| Continuous Variable |  Button  | Threshold |
|:-------------------:|:--------:|:---------:|
|      Horizontal     |   Left   |   < -0.4  |
|      Horizontal     |   Right  |   > 0.4   |
|       Vertical      |    Up    |   > 0.75  |
|       Vertical      |   Down   |  < -0.125 |
|       Attack 1      | Attack 1 |   > 0.75  |
|       Attack 2      | Attack 2 |   > 0.75  |

## Training Multiple Matches
When training matches inside the unity environment, first a previously stored model from the model buffer is selected.  This model plays the game through inference and plays against the most recent policy which is actively training.  When the round ends, the most recent ELO policies are updated.

<p align="center">
<img src="/assets/img/fight/image21.png">
</p>
<p align="center">
Figure 11: Training a single agent
</p>

Multiple matches can be trained at once with each using a different model from the model buffer.  All training agents in each match will be pushing to the same most recent policy.

<p align="center">
<img src="/assets/img/fight/image30.png">
</p>
<p align="center">
Figure 12: Training multiple agents
</p>

## Reward Function
Initially when designing the reward function we decided to start with a spare reward.  The idea being that if the agent is given too much direction, it will “rail road” towards those rewards.  And while this creates an okay way for the agent to play the game, the agent may not completely explore the action space.  The first rewards we started with were for winning and losing a match.  This is the definite goal of the agent.  The agent receives +1 reward if it wins, 0 if there is a draw, and -1 if they lose.
As we tested we decided to introduce smaller rewards when the agent lands a hit or gets hit.  We picked a small value for this to not overshadow the agent's primary goal of winning the match.
In the end the following extrinsic rewards were defined for the agent:

|   Action   | Reward |
|:----------:|:------:|
|  Land Hit  |  + 0.01  |
|   Get Hit  |  - 0.01  |
| Lose Match |   + 1   |
|  Win Match |    - 1   |

## Curiosity Reward
Along with extrinsic reward, the agent also receives intrinsic rewards in the form of curisocity.  ML-Agents implements [6]. In short, the agent receives small intrinsic rewards for encountering states which are surprising to it.  Along with this, the goal is to filter unnecessary noise from the agent's state.

## Hyperparameter Tuning
For tuning hyperparameters, a separate python tuner was developed to handle launching multiple unity environments with different training hyperparameters.  The tuner uses a random search method for finding hyperparameters.
The tuner functions by randomly selecting values for a set of hyperparameters, generating a configuration file for the unity environment, and then launching the unity environment.  The Unity environment trains for 2 million training steps and then closes.  When the environment closes, the tuner generates new hyperparameters and then launches a new unity environment.  The tuner can handle launching and managing multiple environments at once.

<p align="center">
<img src="/assets/img/fight/image5.png">
</p>
<p align="center">
Figure 13: Tuning Hyperparameters
</p>