// This is a javascript implementation of my chopstix project
// which can be found at https://github.com/Khitpit/Chopstix


import { zeros, lusolve } from 'mathjs';

// These two store a list of parent and children states
// for each state respectively. i.e. children[17] is 
// a list of all the states that are direct children 
// of the state with index 17.
//
// These get initialized during initializeGraphEdges()
let parents = null;
let children = null;

// This is a list representing the type of state each 
// state is. See classifyStates() for more info.
//
// This field is initialized during classifyStates()
let classifiedStates = null;

// This is a list which contains the final 'rank' (how
// good or bad a state is) for every state.
//
// This field is initialized during computeRanks()
let ranks = null;

// This field is a number representing how many
// states there are in the game.
let stateCount = null;

// This field represents the total number of fingers
// players have on each hand. Default value is 5.
let numOfFingers = 5;

// This is a list of possible sets of hands a player may
// have during the game. See generateHandSet() for more info.
//
// This field is initialized during generateHandSet()
let handSet = [];

// This field represents whether players are allowed to
// 'switch' or rearrange fingers between hands on their turn
//
// Default value is True.
let switchingAllowed = true;

// This field represents whether players are allowed to 
// 'switch' or rearrange their fingers into the same configuration
// on their turn, effectively skipping it. This variable is ignored
// if switchingAllowed is set to False.
//
// Default value is False
let skippingAllowed = false;

/*
Once init() is called, the above fields will fill out according to 
the rules specified by it's arguments. These fields will remain
filled out, and can be read from later for the same game, so the
calculations do not need to be rerun multiple times.
*/
function init(numOfFingers=5, switchingAllowed=true, skippingAllowed=false) {
    /*
    Executes the chopstix algorithm in four distinct steps:
    1) Variables are initialized, and states are assigned indexes (nodes in the graph)
    2) The graph edges are filled out; states are connected to each other according to settings
    3) States are classified into specific types for computation purposes
    4) Using the classifications, the rank for each state is computed
    */

    // Fields are initialized, algorithm is ready to be run
    numOfFingers = numOfFingers;
    switchingAllowed = switchingAllowed;
    handSet = generateHandSet();
    stateCount = handSet.length ** 2;
    skippingAllowed = skippingAllowed;
    parents = [];
    children = [];
    for (let i = 0; i < stateCount; ++i) {
        parents.push([]);
        children.push([])
    }
    
    // Now all the states will be connected up to one another
    // representing which states lead to which other states
    // in the graph. This is done by filling out the parents[]
    // and children[] fields.
    initializeGraphEdges();

    // Now that the graph states have all been connected together
    // properly, we can classify which states are of what type.
    // The results are stored in the field classifiedStates
    classifyStates()

    // Now we compute the ranks of each state, using the classifications
    // stored in classifiedStates. The result of this is stored in 
    // the field ranks
    computeRanks()

}

function generateHandSet(){
    //Returns a ordered list of every possible set of hands a player may have, starting with (0, 0) and ending with (numFingers - 1, numFingers - 1)
    handSet = []
    for (let x = 0; x < numOfFingers; ++x){
        for (let y = x; y < numOfFingers; ++y){
            handSet.push([x, y]);
        }
    }
    return handSet
}

function stateToIndex(state){
    //Given a state in ((a, b), (c, d)) notation, returns the index number of that state
    let n = numOfFingers
    let a = state[0][0]
    let b = state[0][1]
    let c = state[1][0]
    let d = state[1][1]
    // This monster formula's derivation will be documented in readme
    return (a*n-((a*(a-1))/2)+b-a)*((n*(n+1))/2)+(c*n-(c*(c-1))/2+d-c)
}

function indexToState(index){
    // Given a state's index number, returns the state in ((a, b), (c, d)) notation
    // This monster formula's derivation will be documeted in readme
    return [handSet[Math.floor(index / handSet.length)], handSet[index % handSet.length]]
}    

function gameOverState(index){
    /*
    Returns whether the state with the given index is a game over state, and who won.
    
    Parameters:
        index (int) - The index of the state to check
        
    Returns:
        0.5 - If the state is ((0, 0), (0, 0))
        0   - If the current player has lost
        1   - If the current player has won
        -1  - If neither player has lost
    */
    let state = indexToState(index);
    if (state[0][0] + state[0][1] + state[1][0] + state[1][1] == 0){
        return 0.5
    } else if (state[0][0] + state[0][1] == 0) {
        return 0
    } else if (state[1][0] + state[1][1] == 0) {
        return 1
    } else {
        return -1
    }
}

function initializeGraphEdges(){
    //Initializes the graph structures by filling out the children[] and parent[] fields for each state
    for (let stateIndex = 0; stateIndex < stateCount; ++stateIndex){
        let childrenStates = getChildrenOfState(indexToState(stateIndex))
        childrenStates.forEach(childState => {
            let childIndex = stateToIndex(childState)
            if (!parents[childIndex].includes(stateIndex)) {parents[childIndex].push(stateIndex);}
            if (!children[stateIndex].includes(childIndex)) {children[stateIndex].push(childIndex);}
        });
    }
}

function getChildrenOfState(parentState){
    /*
    Returns all the possible states that can be reached in one move from the parentState
    parameter. If the state has no children, returns an empty list. May return duplicates.
    
    Parameters:
        parentState - a state in the notation ((a, b), (c, d))
        
    Returns:
        A list of states that are immediate children of {parentState}. May be empty.
    */
    let childStates = []
    let attackStates = getAllAttackStates(parentState)
    // If there were no attack states, our opponent has 
    // no hands left to attack, so they lost the game.
    // This means there are no children states to go from here
    // as the game is over.
    if (attackStates.length == 0){
        return childStates;
    }
    
    // Otherwise, we get all the possible states via attacking
    // and all the possible states via switching, and mark them
    // as children of this state
    childStates = attackStates;
    if (switchingAllowed) {
        childStates = childStates.concat(getAllSwitchStates(parentState));
    }
    return childStates;
}

function getAllAttackStates(state) {
    /*
    Returns all the possible states that can be reached in one move from the {state}
    parameter by attacking an opponents hand. If the state has no such children, returns an empty
    list. This function may return duplicate states, i.e. the same state occuring multiple times.
    
    Parameters:
        state - a state in the notation ((a, b), (c, d))
        
    Returns:
        A list of states that can be reached from {state} by attacking the opponent. 
        May be empty.
    */
    let attackStates = []
    for (let playerHand = 0; playerHand < 2; ++playerHand) { // for each hand the player has,
        if (state[0][playerHand]) { // if it is not zero (i.e. they can attack with it)
            for (let oppHand = 0; oppHand < 2; ++oppHand) { // for each of the opponent's hands
                if (state[1][oppHand]) { // if the opponent's hand is not zero (i.e. they can attack it)
                    // newValue is the new number on the attacked hand
                    let newValue = (state[1][oppHand] + state[0][playerHand]) % numOfFingers
                    // We have to make sure the opponents hands stay ordered,
                    // if the new value is greater than the one on the other hand
                    // then the other hand should come first
                    // Note: 1-oppHand is the other hand of the opponent
                    if (newValue > state[1][1-oppHand]){
                        attackStates.push([[state[1][1-oppHand], newValue], state[0]])
                    }else{
                        attackStates.push([[newValue, state[1][1-oppHand]], state[0]])
                    }
                }
            }
        }
    }
    return attackStates;
}

function getAllSwitchStates(state){
    /*
    Returns all the possible states that can be reached in one move from the {state}
    parameter by switching. If the state has no such children, returns an empty list.
    This function may return duplicates.
    Parameters:
        state - a state in the notation ((a, b), (c, d))
        
    Returns:
        A list of states that can be reached from {state} by switching. 
        May be empty.
    */
    let switchStates = []
    let sum = state[0][0] + state[0][1]
    for (let i = 0; i < handSet.length; ++i){
        if(handSet[i][0] + handSet[i][1] == sum){
            if(skippingAllowed | handSet[i] != state[0]){
                switchStates.push([state[1], handSet[i]]);
            }
        }
    }
    return switchStates;
}

// We have four types of states:
// End states - the leaves of the graph = 0/1
// Indeterminate states - states with no path to a leaf = 0.5
// Guaranteed states - states with guarantee to win = 0/1
// General states - states with many potential paths = -1
function classifyStates(){
    /*
    Classifies each state into one of the four categories below.
    
    1) End States - The leaves of the graph, where a player wins
    2) Indeterminate States - States with no path to a End State
    3) Guaranteed States - States with a guaranteed path to an End State where a player wins
    4) General States - States with many potential paths

    Fills out the classifiedStates field with a list of 0's, 1's, 0.5's and -1's:
    0 means the state with that index is either an end state or guaranteed state where the
    player loses.
    1 means the state with that index is either an end state or guaranteed state wher the
    player wins.
    0.5 means the state is indeterminate.
    -1 means the state is a general state.

    This function does not return anything, instead it stores it's results
    in the classifiedStates field
    */
    let statesToClassify = []
    let output = Array(stateCount).fill(0.5)

    for (let i = 1; i < stateCount; ++i){
        if (children[i].length == 0){
            output[i] = gameOverState(i);
            parents[i].forEach(parent => {
                statesToClassify.push(parent);
            })
        }
    }

    for (let limit = 0; limit < 1000 & statesToClassify.length > 0; ++limit) {
        let currState = statesToClassify.shift()
        let originalValue = output[currState]
        let guaranteedLoss = true
        let guaranteedWin = false
        children[currState].forEach(child => {
            if (output[child] != 1){
                guaranteedLoss = false;
            }
            if (output[child] == 0){
                guaranteedWin = true;
            }
        })
        if (guaranteedWin) {
            output[currState] = 1;
        } else if (guaranteedLoss) {
            output[currState] = 0;
        } else {
            output[currState] = -1;
        }

        if (output[currState] != originalValue){
            parents[currState].forEach(parent => {
                if (!statesToClassify.includes(parent)){
                    statesToClassify.push(parent);
                }
            })
        }
    }
    classifiedStates = output;
}

function computeRanks(){
    /*
    Computes the ranks of each state based on their classifications.
    End states and guaranteed states are given the rank 0 or 1 according
    to whether the player loses or wins, respectively. Indeterminate states
    are given the rank 0.5 to represent a draw. The remaining general states'
    ranks are calculated via a matrix, with a rank between 0 and 1, closer to 0
    meaning the state is likely to end up losing, and closer to 1 meaning the 
    state is more likely to end up with the current player winning.
    
    This function does not return anything, instead it stores it's results
    in the ranks field
    */
    let mat = zeros(stateCount, stateCount, 'sparse')
    let solution = zeros(stateCount)
    // assign the rest of the states a value here:
    for (let stateIndex = 0; stateIndex < stateCount; ++stateIndex){
        if (classifiedStates[stateIndex] != -1) {
            mat.set([stateIndex, stateIndex], 1);
            solution.set([stateIndex], classifiedStates[stateIndex]);
        } else {
            mat.set([stateIndex, stateIndex], children[stateIndex].length);
            solution.set([stateIndex], children[stateIndex].length);
            children[stateIndex].forEach(child => {
                mat.set([stateIndex, child], 1);
            })
        }
    }
    ranks = lusolve(mat, solution);
}
