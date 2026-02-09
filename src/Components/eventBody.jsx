import * as React from 'react';
import { SingleAction } from './singleAction';
import { Droppable } from 'react-beautiful-dnd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import Draggable1 from 'react-draggable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WARN_MSG_POS, WARN_MSG_SIZE } from '../constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CategorySidebar } from './CategorySidebar';
import { LibraryModal } from './LibraryModal';
import PetsIcon from '@mui/icons-material/Pets';
import LandscapeIcon from '@mui/icons-material/Landscape';
import AlignmentGuide from './AlignmentGuide';
import '../styles/collisionEffects.css';
import { playSound, initAudio } from '../utils/sounds';
import ActionHistoryFooter from './ActionHistoryFooter';
import { FaChartBar } from 'react-icons/fa';
import AnalyticsDashboard from './AnalyticsDashboard';

const ALIGNMENT_THRESHOLD = 5; // pixels within which to show alignment guides
const STAGE_BOUNDARY_X = 290;
const STAGE_BOUNDARY_Y = 140;
const IMMEDIATE_ACTION_INDEX = 0;
const SPIN_JUMP_DELAY = 600;
const WIGGLE_ANGLE = 15;
const WIGGLE_SWING_ANGLE = -30;
const WIGGLE_STEP_DELAY = 300;
const WIGGLE_RETURN_DELAY = 600;

export const EventBody = (props) => {
    const {
        moves,
        setMoves,
        actions,
        setActions,
        setActions2, 
        actions2
    } = props;

    const ref = useRef(null);
    const ref2 = useRef(null);
    const movesContainerRef = useRef(null);
    const actionHandlersRef = useRef({});
    const [activeCategory, setActiveCategory] = React.useState('Motion');
    const [isColliding, setIsColliding] = React.useState(false);
    const [hasSwappedAnimations, setHasSwappedAnimations] = React.useState(false);
    const [sprite1Visible, setSprite1Visible] = React.useState(true);
    const [sprite2Visible, setSprite2Visible] = React.useState(true);

    /// r, t values corresspond to right , top values  
    let r = '0%';
    let t = '0%';
    let scale = 1;
    let angle = 0;
    let r2 = '0%';
    let t2 = '0%';
    let scale2 = 1;
    let angle2 = 0;

    const [hello, setHello] = React.useState(false);
    const [hello2, setHello2] = React.useState(false);
    const [think, setThink] = React.useState(false);
    const [think2, setThink2] = React.useState(false);
    const [theme, setTheme] = React.useState(false);
    const [displayAddIcon, setDisplayAddIcon] = React.useState(true);
    const catImage = require('../Assets/images/cat.png');
    const jerryImage = require('../Assets/images/jerry1.png');
    const [sprite, setSprite] = React.useState(catImage);
    const [sprite2, setSprite2] = React.useState(null);
    const [activeSprite, setActiveSprite] = React.useState(1); // 1 for first sprite, 2 for second sprite
    const [currentAction, setCurrentAction] = React.useState('');

    const [isAnimating, setIsAnimating] = React.useState(false);
    const timeoutRefs = React.useRef(new Set());

    const [spriteLibraryOpen, setSpriteLibraryOpen] = React.useState(false);
    const [backdropLibraryOpen, setBackdropLibraryOpen] = React.useState(false);

    const [alignmentGuides, setAlignmentGuides] = React.useState({
        vertical: { show: false, position: 0 },
        horizontal: { show: false, position: 0 }
    });

    const [collisionEffects, setCollisionEffects] = React.useState({
        ripple: false,
        soundWave: false,
        swapArrows: false,
        position: { x: 0, y: 0 }
    });

    const [currentVolume, setCurrentVolume] = React.useState(1);

    const [actionQueue, setActionQueue] = React.useState([]);
    const [isReplaying, setIsReplaying] = React.useState(false);
    const isReplayingRef = useRef(false);
    const [replayIndex, setReplayIndex] = React.useState(-1);
    const [spriteFilter, setSpriteFilter] = React.useState('all');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [score, setScore] = React.useState(0);
    const [operatorResult, setOperatorResult] = React.useState(null);
    const scoreRef = useRef(score);

    console.log("rendering...");

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        isReplayingRef.current = isReplaying;
    }, [isReplaying]);

    useEffect(() => {
        const container = movesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const categories = Array.from(container.getElementsByClassName('moves__category'));
            const containerHeight = container.clientHeight;

            // Find which category is most visible
            let maxVisibleHeight = 0;
            let mostVisibleCategory = 'Motion';

            categories.forEach((category) => {
                const rect = category.getBoundingClientRect();
                const categoryTop = rect.top;
                const categoryBottom = rect.bottom;
                const visibleHeight = Math.min(categoryBottom, containerHeight) - Math.max(categoryTop, 0);

                if (visibleHeight > maxVisibleHeight) {
                    maxVisibleHeight = visibleHeight;
                    mostVisibleCategory = category.getAttribute('data-category') || 'Motion';
                }
            });

            setActiveCategory(mostVisibleCategory);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const clearAllTimeouts = () => {
        timeoutRefs.current.forEach(id => clearTimeout(id));
        timeoutRefs.current.clear();
    };

    const safeSetTimeout = (fn, delay) => {
        const id = setTimeout(() => {
            fn();
            timeoutRefs.current.delete(id);
        }, delay);
        timeoutRefs.current.add(id);
        return id;
    };

    function transform(temp, xAxis, action1) {
        if (!isAnimating) return;

        let value = temp.toString();
        if (xAxis) {
            if (action1) {
                r = value.concat('%');
            } else {
                r2 = value.concat('%');
            }
        } else {
            if (action1) {
                t = value.concat('%');
            } else {
                t2 = value.concat('%');
            }
        }

        const currentRef = action1 ? ref.current : ref2.current;
        if (currentRef) {
            const transform = action1 
                ? `scale(${scale})translate(${r}, ${t}) rotate(${angle}deg)`
                : `scale(${scale2})translate(${r2}, ${t2}) rotate(${angle2}deg)`;
            currentRef.style.transform = transform;
        }
    }

    function moveUp (i, action1) {
        //move up top - 50
        pushActionToQueue(action1 ? 1 : 2, 'move', '-50 steps', 'Move up 50 steps');
        safeSetTimeout(() => {
            let temp = parseInt(action1 ? t.slice(0,-1):t2.slice(0,-1));
            temp = temp - 50;
            if(temp<-140){
                refresh(WARN_MSG_POS);
                return
            }
            transform(temp, false, action1);
        }, i * 1500);
    }
    function moveDown (i, action1) {  
        //move down top + 50    
        pushActionToQueue(action1 ? 1 : 2, 'move', '50 steps', 'Move down 50 steps');
        safeSetTimeout(() => {
            let temp = parseInt(action1 ? t.slice(0,-1):t2.slice(0,-1));
            temp = temp + 50;
            if(temp>140){
                refresh(WARN_MSG_POS);
                return
            }
           transform(temp, false, action1);
        }, i * 1500);
    }
    function moveRight (i, action1) {
        //move right right+50
        pushActionToQueue(action1 ? 1 : 2, 'move', '50 steps', 'Move 50 steps');
        safeSetTimeout(() => {
            let temp = parseInt(action1 ?r.slice(0,-1):r2.slice(0,-1));
            temp = temp + 50;
            if(temp>290){
                refresh(WARN_MSG_POS);
                return
            }
            transform(temp, true, action1);
        }, i * 1500);
    }
    function moveLeft(i, action1) {
        //move right right-50 
        pushActionToQueue(action1 ? 1 : 2, 'move', '-50 steps', 'Move -50 steps');
        safeSetTimeout(() => {
            let temp = parseInt(action1 ? r.slice(0,-1):r2.slice(0,-1));
            temp = temp - 50;
            if(temp<-290){
                refresh(WARN_MSG_POS);
                return
            }
            transform(temp, true, action1);
        }, i * 1500);
    }
    function sayHello(i, action1){
        setCurrentAction('Say Hello for 5 sec');
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Hello', 'Say Hello for 5 sec');
        safeSetTimeout(() => {
            action1 ? setHello(true) : setHello2(true);
        }, i * 1500);
        //close hello after 5 sec
        safeSetTimeout(() => {
            if (currentAction === 'Say Hello for 5 sec') {
                action1? setHello(false):setHello2(false);
                setCurrentAction('');
            }
        }, (i * 1500) + 5000);
    }

    function thinkHmmm(i, action1){
        pushActionToQueue(action1 ? 1 : 2, 'think', 'Hmmm', 'Think Hmmm for 3 sec');
        safeSetTimeout(() => {
            setCurrentAction('Think Hmmm for 3 sec');
            action1 ? setThink(true) : setThink2(true);
        }, i * 1500);
        //close think after 3 sec
        safeSetTimeout(() => {
            if (currentAction === 'Think Hmmm for 3 sec') {
                action1? setThink(false):setThink2(false);
                setCurrentAction('');
            }
        }, (i * 1500) + 3000);
    }

    function sayBye(i, action1){
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Bye', 'Say Bye');
        safeSetTimeout(()=>{
            setCurrentAction('Say Bye');
            // Clear any existing messages first
            setHello(false);
            setHello2(false);
            // Show message based on collision state
            if (hasSwappedAnimations) {
                // After collision, messages are swapped
                action1 ? setHello2(true) : setHello(true);
            } else {
                // Before collision, normal behavior
            action1 ? setHello(true) : setHello2(true);
            }
        }, (i* 1500));
        // Clear message after display
        safeSetTimeout(()=>{
            if (currentAction === 'Say Bye') {
                setHello(false);
                setHello2(false);
                setCurrentAction('');
            }
        }, (i*1500) + 100); // Small delay to ensure message shows
    }

    function sayHii(i, action1){
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Hii', 'Say Hii');
        safeSetTimeout(()=>{
            setCurrentAction('Say Hii');
            // Clear any existing messages first
            setHello(false);
            setHello2(false);
            // Show message based on collision state
            if (hasSwappedAnimations) {
                // After collision, messages are swapped
                action1 ? setHello2(true) : setHello(true);
            } else {
                // Before collision, normal behavior
            action1 ? setHello(true) : setHello2(true);
            }
        }, (i* 1500));
        // Clear message after display
        safeSetTimeout(()=>{
            if (currentAction === 'Say Hii') {
                setHello(false);
                setHello2(false);
                setCurrentAction('');
            }
        }, (i*1500) + 100); // Small delay to ensure message shows
    }

    function thinkSeeYou(i, action1){
        pushActionToQueue(action1 ? 1 : 2, 'think', 'See you', 'Think See you');
        safeSetTimeout(()=>{
            setCurrentAction('Think See you');
            // Clear any existing messages first
            setThink(false);
            setThink2(false);
            // Show message based on collision state
            if (hasSwappedAnimations) {
                // After collision, messages are swapped
                action1 ? setThink2(true) : setThink(true);
            } else {
                // Before collision, normal behavior
            action1 ? setThink(true) : setThink2(true);
            }
        }, (i* 1500));
        // Clear message after display
        safeSetTimeout(()=>{
            if (currentAction === 'Think See you') {
                setThink(false);
                setThink2(false);
                setCurrentAction('');
            }
        }, (i*1500) + 100); // Small delay to ensure message shows
    }

    function moveXY(xInput, yInput, random, i, action1) {
        // combined function to move to random postion and to x, y cordinates  
        const actionName = random ? 'Go to random position' : 'Go to coordinates';
        pushActionToQueue(action1 ? 1 : 2, 'move', `(${xInput}, ${yInput})`, actionName);
        safeSetTimeout(()=>{
            let tempR = parseInt(action1 ? r.slice(0,-1) : r2.slice(0,-1));
            let tempT = parseInt(action1 ? t.slice(0,-1) : t2.slice(0,-1));
            // asign the x, y values 
            // or to random values 
            tempR = tempR !== parseInt(xInput) && parseInt(xInput) !== 0 
                ? (random ? Math.floor((Math.random() * (-290-290)) +290) : parseInt(xInput)) 
                : tempR;
            tempT = tempT !== (-parseInt(yInput)) && parseInt(yInput) !== 0 
                ? (random ? Math.floor((Math.random() * (-140-140)) + 140) : -parseInt(yInput)) 
                : tempT;
            if(parseInt(yInput)===0){
                tempT = 0;
            }
            if (parseInt(xInput)===0){
                tempR = 0;
            }
            //return to intial if it is out of bounds 
            if(tempR<-290 || tempR>290 || tempT<-140 || tempT>140){
                refresh(WARN_MSG_POS);
                return
            }
            let valueR = tempR.toString();
            let valueT = tempT.toString();
            if(action1){
                r = valueR.concat('%');
                t = valueT.concat('%');
            } else {
                r2 = valueR.concat('%');
                t2 = valueT.concat('%');
            }
            // apply tarnsform for respective sprite
            action1 ? ref.current.style.transform = `scale(${scale})translate(${r}, ${t}) rotate(${angle}deg)`
                : ref2.current.style.transform = `scale(${scale2})translate(${r2}, ${t2}) rotate(${angle2}deg)`;
        }, (i * 1500));
    }
    const rotate = (rAngle,i, action1) =>{
        pushActionToQueue(action1 ? 1 : 2, 'turn', `${rAngle} degrees`, `turn ${rAngle} degrees`);
        safeSetTimeout(() => {
            //rotate the sprite 
            action1 ? angle += rAngle : angle2+=rAngle;
            // apply tarnsform for respective sprite
            action1 ? ref.current.style.transform = `scale(${scale})translate(${r}, ${t}) rotate(${angle}deg)`
                : ref2.current.style.transform = `scale(${scale2})translate(${r2}, ${t2}) rotate(${angle2}deg)`;
        }, (i * 1500));
    }
    function handleScale(size, increase, idx, action1){
        //combined function to scale from resize component and resize action item 
        // If size is provided, we're using the Resize component
        if(size) {
            const isFirstSprite = activeSprite === 1;
            let newScale = size === 'medium' ? 2 : (size === 'large' ? 3 : 1);
            const sizeLabel = size === 'medium' ? 'Set size medium' : (size === 'large' ? 'Set size large' : 'Set size small');
            pushActionToQueue(isFirstSprite ? 1 : 2, 'scale', size, sizeLabel);
            if(isFirstSprite) {
                scale = newScale;
                ref.current.style.transform = `scale(${newScale}) translate(${r}, ${t}) rotate(${angle}deg)`;
            } else if(sprite2) {
                scale2 = newScale;
                ref2.current.style.transform = `scale(${newScale}) translate(${r2}, ${t2}) rotate(${angle2}deg)`;
            }
            return;
        }
        
        // If no size provided, we're using the action items (increase/decrease)
        if(increase) {
            pushActionToQueue(action1 ? 1 : 2, 'scale', 'increase', 'size increase');
            safeSetTimeout(() => {
                action1 ? scale += 0.2 : scale2 += 0.2;
                if(action1){
                    if (scale<3){
                        ref.current.style.transform = `scale(${scale})translate(${r}, ${t}) rotate(${angle}deg)`;
                    }else{
                        refresh(WARN_MSG_SIZE);}
                } else{
                    if (scale2<3){
                        ref2.current.style.transform = `scale(${scale2})translate(${r2}, ${t2}) rotate(${angle2}deg)`;
                    }else{
                        refresh(WARN_MSG_SIZE);}
                }
            }, idx*1500);
            return;
        } else {
            pushActionToQueue(action1 ? 1 : 2, 'scale', 'decrease', 'size decrease');
            safeSetTimeout(() => {
                action1 ? scale -= 0.2 : scale2 -= 0.2;
                if(action1){
                    if (scale>0.5){
                        ref.current.style.transform = `scale(${scale})translate(${r}, ${t}) rotate(${angle}deg)`;
                    }else{
                        refresh(WARN_MSG_SIZE);}
                } else{
                    if (scale2>0.5){
                        ref2.current.style.transform = `scale(${scale2})translate(${r2}, ${t2}) rotate(${angle2}deg)`;
                    }else{
                        refresh(WARN_MSG_SIZE);}
                }
            }, idx*1500);
            return;
        }
    }

    function showSprite(i, action1) {
        if (!isAnimating) return;
        safeSetTimeout(() => {
            if (action1) {
                setSprite1Visible(true);
                if (ref.current) {
                    ref.current.style.visibility = 'visible';
                }
            } else {
                setSprite2Visible(true);
                if (ref2.current) {
                    ref2.current.style.visibility = 'visible';
                }
            }
        }, i * 1500);
    }

    function hideSprite(i, action1) {
        if (!isAnimating) return;
        safeSetTimeout(() => {
            if (action1) {
                setSprite1Visible(false);
                if (ref.current) {
                    ref.current.style.visibility = 'hidden';
                }
            } else {
                setSprite2Visible(false);
                if (ref2.current) {
                    ref2.current.style.visibility = 'hidden';
                }
            }
        }, i * 1500);
    }

    const announceEvent = (message, action1, actionName = message) => {
        pushActionToQueue(action1 ? 1 : 2, 'event', message, actionName);
        toast.info(message, {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const handleSensingResult = (label, result, action1, actionName = label) => {
        const resultLabel = result ? 'yes' : 'no';
        pushActionToQueue(action1 ? 1 : 2, 'sensing', `${label}: ${resultLabel}`, actionName, { result });
        toast.info(`${label}: ${resultLabel}`, {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const handleOperatorResult = (label, value, action1, actionName = label) => {
        setOperatorResult(value);
        pushActionToQueue(action1 ? 1 : 2, 'operator', `${label}: ${value}`, actionName, { result: value });
        toast.info(`${label}: ${value}`, {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const updateScore = (updater, action1, actionName = 'Update score') => {
        const currentScore = scoreRef.current;
        const nextScore = typeof updater === 'function' ? updater(currentScore) : updater;
        scoreRef.current = nextScore;
        setScore(nextScore);
        pushActionToQueue(action1 ? 1 : 2, 'variable', `score ${nextScore}`, actionName, { score: nextScore });
        toast.info(`Score: ${nextScore}`, {
            position: "top-center",
            autoClose: 1000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    };

    const runSpinJump = (action1) => {
        pushActionToQueue(action1 ? 1 : 2, 'custom', 'Spin jump', 'Spin jump');
        rotate(360, IMMEDIATE_ACTION_INDEX, action1);
        moveUp(IMMEDIATE_ACTION_INDEX, action1);
        safeSetTimeout(() => moveDown(IMMEDIATE_ACTION_INDEX, action1), SPIN_JUMP_DELAY);
    };

    const runWiggle = (action1) => {
        pushActionToQueue(action1 ? 1 : 2, 'custom', 'Wiggle', 'Wiggle');
        rotate(WIGGLE_ANGLE, IMMEDIATE_ACTION_INDEX, action1);
        safeSetTimeout(() => rotate(WIGGLE_SWING_ANGLE, IMMEDIATE_ACTION_INDEX, action1), WIGGLE_STEP_DELAY);
        safeSetTimeout(() => rotate(WIGGLE_ANGLE, IMMEDIATE_ACTION_INDEX, action1), WIGGLE_RETURN_DELAY);
    };

    const startActions = (action, idx, action1) => {
        if (!isAnimating) return;
        const delay = idx * 1500;

        switch(action) {
            case 'Move 50 steps': {
                safeSetTimeout(() => moveRight(idx, action1), delay);
                break;
            }
            case 'Move up 50 steps': {
                safeSetTimeout(() => moveUp(idx, action1), delay);
                break;
            }
            case 'Move -50 steps': {
                safeSetTimeout(() => moveLeft(idx, action1), delay);
                break;
            }
            case 'Move down 50 steps': {
                safeSetTimeout(() => moveDown(idx, action1), delay);
                break;
            }
            case 'turn 45 degrees': {
                safeSetTimeout(() => rotate(45, idx, action1), delay);
                break;
            }
            case 'turn 90 degrees': {
                safeSetTimeout(() => rotate(90, idx, action1), delay);
                break;
            }
            case 'turn 135 degrees': {
                safeSetTimeout(() => rotate(135, idx, action1), delay);
                break;
            }
            case 'turn 180 degrees': {
                safeSetTimeout(() => rotate(180, idx, action1), delay);
                break;
            }
            case 'turn 360 degrees': {
                safeSetTimeout(() => rotate(360, idx, action1), delay);
                break;
            }
            case 'Go to coordinates': {
                const xInput = prompt('Enter X coordinate (-290 to 290):', '0');
                const yInput = prompt('Enter Y coordinate (-140 to 140):', '0');
                if (xInput !== null && yInput !== null) {
                    safeSetTimeout(() => moveXY(xInput, yInput, false, idx, action1), delay);
                }
                break;
            }
            case 'Set size small': {
                safeSetTimeout(() => handleScale('small', null, idx, action1), delay);
                break;
            }
            case 'Set size medium': {
                safeSetTimeout(() => handleScale('medium', null, idx, action1), delay);
                break;
            }
            case 'Set size large': {
                safeSetTimeout(() => handleScale('large', null, idx, action1), delay);
                break;
            }
            case 'Say Hello for 5 sec': {
                safeSetTimeout(() => sayHello(idx, action1), delay);
                break;
            }
            case 'Think Hmmm for 3 sec': {
                safeSetTimeout(() => thinkHmmm(idx, action1), delay);
                break;
            }
            case 'Say Bye': {
                safeSetTimeout(() => sayBye(idx, action1), delay);
                break;
            }
            case 'Say Hii': {
                safeSetTimeout(() => sayHii(idx, action1), delay);
                break;
            }
            case 'Think See you': {
                safeSetTimeout(() => thinkSeeYou(idx, action1), delay);
                break;
            }
            case 'repeat': {
                const maxDelay = Math.max(
                    actions?.length || 0,
                    actions2?.length || 0
                ) * 1500;

                safeSetTimeout(() => {
                    // If this is the first sprite's repeat
                    if(action1) {
                        // Check if second sprite also has repeat
                        const sprite2HasRepeat = actions2?.some(item => item.todo === 'repeat');
                        if(sprite2HasRepeat) {
                            // Both sprites have repeat, restart both after all current animations finish
                            safeSetTimeout(() => {
                                clearAllTimeouts();
                                setIsAnimating(true);
                                runAction1();
                                runAction2();
                            }, maxDelay);
                        } else {
                            // Only first sprite has repeat
                            runAction1();
                        }
                    } else {
                        // If this is the second sprite's repeat
                        const sprite1HasRepeat = actions?.some(item => item.todo === 'repeat');
                        if(sprite1HasRepeat) {
                            // Both sprites have repeat, restart both after all current animations finish
                            safeSetTimeout(() => {
                                clearAllTimeouts();
                                setIsAnimating(true);
                                runAction1();
                                runAction2();
                            }, maxDelay);
                        } else {
                            // Only second sprite has repeat
                            runAction2();
                        }
                    }
                }, delay);
                break;
            }
            case 'show': {
                safeSetTimeout(() => showSprite(idx, action1), delay);
                break;
            }
            case 'hide': {
                safeSetTimeout(() => hideSprite(idx, action1), delay);
                break;
            }
            case 'Play Meow Sound': {
                safeSetTimeout(() => playSound('meow', currentVolume), delay);
                break;
            }
            case 'Play Pop Sound': {
                safeSetTimeout(() => playSound('pop', currentVolume), delay);
                break;
            }
            case 'Play Bell Sound': {
                safeSetTimeout(() => playSound('bell', currentVolume), delay);
                break;
            }
            case 'Play Drum Beat': {
                safeSetTimeout(() => playSound('drum', currentVolume), delay);
                break;
            }
            case 'Play Piano Note': {
                safeSetTimeout(() => playSound('piano', currentVolume), delay);
                break;
            }
            case 'Play Laugh Sound': {
                safeSetTimeout(() => playSound('laugh', currentVolume), delay);
                break;
            }
            case 'Increase Volume': {
                safeSetTimeout(() => {
                    const newVolume = Math.min(currentVolume + 0.2, 1);
                    setCurrentVolume(newVolume);
                    // Play a test sound to demonstrate volume change
                    playSound('pop', newVolume);
                }, delay);
                break;
            }
            case 'Decrease Volume': {
                safeSetTimeout(() => {
                    const newVolume = Math.max(currentVolume - 0.2, 0);
                    setCurrentVolume(newVolume);
                    // Play a test sound to demonstrate volume change
                    playSound('pop', newVolume);
                }, delay);
                break;
            }
            case 'When flag clicked': {
                safeSetTimeout(() => announceEvent('Green flag clicked!', action1, 'When flag clicked'), delay);
                break;
            }
            case 'Broadcast hello': {
                safeSetTimeout(() => announceEvent('Broadcast: hello!', action1, 'Broadcast hello'), delay);
                break;
            }
            case 'Touching edge?': {
                safeSetTimeout(() => {
                    const currentX = parseInt(action1 ? r : r2, 10);
                    const currentY = parseInt(action1 ? t : t2, 10);
                    const touchingEdge = Math.abs(currentX) >= STAGE_BOUNDARY_X
                        || Math.abs(currentY) >= STAGE_BOUNDARY_Y;
                    handleSensingResult('Touching edge', touchingEdge, action1, 'Touching edge?');
                }, delay);
                break;
            }
            case 'Touching sprite?': {
                safeSetTimeout(() => {
                    const shouldCheckCollision = !displayAddIcon && sprite2;
                    const isTouchingSprite = shouldCheckCollision ? checkCollisionCallback() : false;
                    handleSensingResult('Touching sprite', isTouchingSprite, action1, 'Touching sprite?');
                }, delay);
                break;
            }
            case 'Pick random 1 to 10': {
                safeSetTimeout(() => {
                    const value = Math.floor(Math.random() * 10) + 1;
                    handleOperatorResult('Random 1-10', value, action1, 'Pick random 1 to 10');
                }, delay);
                break;
            }
            case 'Score + 5': {
                safeSetTimeout(() => {
                    const value = scoreRef.current + 5;
                    handleOperatorResult('Score + 5', value, action1, 'Score + 5');
                }, delay);
                break;
            }
            case 'Set score to 0': {
                safeSetTimeout(() => updateScore(0, action1, 'Set score to 0'), delay);
                break;
            }
            case 'Change score by 1': {
                safeSetTimeout(() => updateScore(prevScore => prevScore + 1, action1, 'Change score by 1'), delay);
                break;
            }
            case 'Spin jump': {
                safeSetTimeout(() => runSpinJump(action1), delay);
                break;
            }
            case 'Wiggle': {
                safeSetTimeout(() => runWiggle(action1), delay);
                break;
            }
            default: break;
        }
    };

    actionHandlersRef.current.startActions = startActions;

    const startActionsCallback = useCallback(
        (action, idx, action1) => {
            const handler = actionHandlersRef.current.startActions;
            if (handler) {
                handler(action, idx, action1);
            }
        },
        []
    );

    // Function to create collision effects
    const createCollisionEffects = (x, y) => {
        setCollisionEffects({
            ripple: true,
            soundWave: true,
            swapArrows: true,
            position: { x, y }
        });

        // Reset effects after animations complete
        setTimeout(() => {
            setCollisionEffects({
                ripple: false,
                soundWave: false,
                swapArrows: false,
                position: { x: 0, y: 0 }
            });
        }, 1000);
    };

    // Enhanced collision detection
    const handleCollision = (draggedRect, otherRect) => {
        const collision = checkCollisionCallback();
        if (collision && !isColliding) {
            setIsColliding(true);
            if (!hasSwappedAnimations) {
                // Calculate collision point
                const x = (draggedRect.left + draggedRect.right) / 2;
                const y = (draggedRect.top + draggedRect.bottom) / 2;
                createCollisionEffects(x, y);
                
                // Add haptic feedback if available
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(100);
                }

                swapAnimations();
            }
        } else if (!collision && isColliding) {
            setIsColliding(false);
        }
    };

    // Update handleDrag to use enhanced collision
    const handleDrag = (e, data, isFirstSprite) => {
        const draggedRef = isFirstSprite ? ref.current : ref2.current;
        const otherRef = isFirstSprite ? ref2.current : ref.current;

        if (draggedRef && otherRef && !displayAddIcon) {
            const draggedRect = draggedRef.getBoundingClientRect();
            const otherRect = otherRef.getBoundingClientRect();
            
            handleCollision(draggedRect, otherRect);
            
            // Show alignment guides
            const guides = checkAlignment(draggedRect, otherRect);
            setAlignmentGuides(guides);
        }
    };

    // Function to check collision between two sprites
    const checkCollision = () => {
        if (!ref.current || !ref2.current || !sprite2) return false;
        
        const rect1 = ref.current.getBoundingClientRect();
        const rect2 = ref2.current.getBoundingClientRect();
        
        // Calculate the actual sprite dimensions (accounting for scale)
        const sprite1Width = rect1.width * 0.7;  // Increased collision area
        const sprite1Height = rect1.height * 0.7;
        const sprite2Width = rect2.width * 0.7;
        const sprite2Height = rect2.height * 0.7;

        // Calculate centers of both sprites
        const center1X = rect1.left + rect1.width / 2;
        const center1Y = rect1.top + rect1.height / 2;
        const center2X = rect2.left + rect2.width / 2;
        const center2Y = rect2.top + rect2.height / 2;

        // Calculate the distance between centers
        const distanceX = Math.abs(center1X - center2X);
        const distanceY = Math.abs(center1Y - center2Y);

        // Check if the sprites are actually overlapping with a slightly larger detection area
        return (distanceX < (sprite1Width + sprite2Width) / 2.2) && 
               (distanceY < (sprite1Height + sprite2Height) / 2.2);
    };

    actionHandlersRef.current.checkCollision = checkCollision;

    const checkCollisionCallback = useCallback(() => {
        const handler = actionHandlersRef.current.checkCollision;
        if (handler) {
            return handler();
        }
        return false;
    }, []);

    // Function to swap animations between sprites
    const swapAnimations = () => {
        if (!hasSwappedAnimations && actions?.length > 0 && actions2?.length > 0) {
            clearAllTimeouts();
            setIsAnimating(false);  // Stop current animations
            
            // Clear all messages immediately
            setHello(false);
            setHello2(false);
            setThink(false);
            setThink2(false);
            setCurrentAction('');
            
            // Store current positions and states
            const tempActions = [...actions];
            const tempActions2 = [...actions2];
            
            // Store current visibility states
            const tempSprite1Visible = sprite1Visible;
            const tempSprite2Visible = sprite2Visible;
            
            // Swap actions and visibility states
            setActions(tempActions2);
            setActions2(tempActions);
            setSprite1Visible(tempSprite2Visible);
            setSprite2Visible(tempSprite1Visible);
            
            setHasSwappedAnimations(true);
            
            // Show collision notification
            toast.info("Sprites collided! Animations swapped!", {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Restart animations with swapped behaviors after a short delay
            safeSetTimeout(() => {
                setIsAnimating(true);
                
                // Start both animations simultaneously with swapped actions
                if (tempActions2.length) {
                    tempActions2.forEach((item, i) => {
                                        startActionsCallback(item.todo, i, true);
                    });
                }
                
                if (tempActions.length) {
                    tempActions.forEach((item, i) => {
                                        startActionsCallback(item.todo, i, false);
                    });
                }
            }, 500);
        }
    };

    const handlePlay = () => {
        // Initialize audio context
        initAudio();
        
        // Clear any existing animations and states
        clearAllTimeouts();
        setIsAnimating(false);
        setIsColliding(false);
        setHasSwappedAnimations(false);
        setHello(false);
        setHello2(false);
        setThink(false);
        setThink2(false);
        setCurrentAction('');
        
        // Reset positions
        r = '0%';
        t = '0%';
        r2 = '0%';
        t2 = '0%';
        scale = 1;
        angle = 0;
        scale2 = 1;
        angle2 = 0;

        // Apply initial transforms
        if (ref.current) {
            ref.current.style.transform = `scale(${scale}) translate(${r}, ${t}) rotate(${angle}deg)`;
        }
        if (ref2.current) {
            ref2.current.style.transform = `scale(${scale2}) translate(${r2}, ${t2}) rotate(${angle2}deg)`;
        }

        // Start animations immediately
        setIsAnimating(true);
        
        // Start both sprites' animations simultaneously
            if (actions?.length) {
            actions.forEach((item, i) => {
                startActionsCallback(item.todo, i, true);
            });
            }
            
            if (!displayAddIcon && actions2?.length) {
            actions2.forEach((item, i) => {
                startActionsCallback(item.todo, i, false);
            });
        }
    };

    const refresh = (msg) => {
        clearAllTimeouts();
        setIsAnimating(false);
        setIsColliding(false);
        setHasSwappedAnimations(false);
        setCurrentAction('');
        setHello(false);
        setHello2(false);
        setThink(false);
        setThink2(false);
        // Reset visibility states
        setSprite1Visible(true);
        setSprite2Visible(true);
        
        // Reset positions
        r = '0%';
        t = '0%';
        r2 = '0%';
        t2 = '0%';
        scale = 1;
        angle = 0;
        scale2 = 1;
        angle2 = 0;

        // Apply transforms
        if (ref.current) {
            ref.current.style.transform = `scale(${scale}) translate(${r}, ${t}) rotate(${angle}deg)`;
        }
        if (ref2.current) {
            ref2.current.style.transform = `scale(${scale2}) translate(${r2}, ${t2}) rotate(${angle2}deg)`;
        }

        if (msg) {
            toast.warn(msg, {
                position: "top-center",
                autoClose: 1000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };

    //function to start the actions
    //send true as a parameter if the actions are for the first sprite else false 
    function runAction1(){
        if (actions?.length) {
            actions.forEach((item, i) => {
                startActionsCallback(item.todo, i, true);
            });
        }
    }
    
    function runAction2(){
        if (!displayAddIcon && actions2?.length) {
            actions2.forEach((item, i) => {
                startActionsCallback(item.todo, i, false);
            });
        }
    }
    
    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        const categoryElement = movesContainerRef.current?.querySelector(`[data-category="${category}"]`);
        if (categoryElement) {
            categoryElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const renderCategory = (categoryName, color, moves) => {
        const categoryMoves = moves?.filter(move => move.category === categoryName);
        if (!categoryMoves || categoryMoves.length === 0) return null;

        return (
            <div className="moves__category" data-category={categoryName}>
                <div className="category__heading">
                    {categoryName}
                </div>
                {categoryMoves.map((move) => (
                    <SingleAction
                        disableDelete={true}
                        index={moves.findIndex(m => m.id === move.id)}
                        moves={moves}
                        move={move}
                        key={move.id}
                        setMoves={setMoves}
                    />
                ))}
            </div>
        );
    };

    // Update collision effect to preserve visibility states
    useEffect(() => {
        let collisionInterval;
        let lastCollisionState = false;
        
        if (isAnimating && !displayAddIcon && ref.current && ref2.current && sprite2) {
            collisionInterval = setInterval(() => {
                if (!isAnimating) return;
                
                    const collision = checkCollisionCallback();
                if (collision !== lastCollisionState) {
                    lastCollisionState = collision;
                    if (collision) {
                        setIsColliding(true);
                        // Store current visibility states before swap
                        const tempSprite1Visible = sprite1Visible;
                        const tempSprite2Visible = sprite2Visible;
                        
                        // Swap animations
                        if (!hasSwappedAnimations && actions?.length > 0 && actions2?.length > 0) {
                            clearAllTimeouts();
                            setIsAnimating(false);
                            
                            // Clear any existing messages
                        setHello(false);
                        setHello2(false);
                        setThink(false);
                        setThink2(false);
                        setCurrentAction('');
                            
                            // Store current actions
                            const tempActions = [...actions];
                            const tempActions2 = [...actions2];
                            
                            // Swap actions and visibility states
                            setActions(tempActions2);
                            setActions2(tempActions);
                            setSprite1Visible(tempSprite2Visible);
                            setSprite2Visible(tempSprite1Visible);
                            
                            setHasSwappedAnimations(true);
                            
                            toast.info("Sprites collided! Animations swapped!", {
                                position: "top-center",
                                autoClose: 1000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                            });

                            // Restart animations with swapped behaviors
                            safeSetTimeout(() => {
                                setIsAnimating(true);
                                if (tempActions2.length) {
                                    tempActions2.forEach((item, i) => {
                                        startActionsCallback(item.todo, i, true);
                                    });
                                }
                                if (tempActions.length) {
                                    tempActions.forEach((item, i) => {
                                        startActionsCallback(item.todo, i, false);
                                    });
                                }
                            }, 500);
                        }
                    } else {
                        setIsColliding(false);
                        setHasSwappedAnimations(false);
                    }
                }
            }, 30);
        }

        return () => {
            if (collisionInterval) {
                clearInterval(collisionInterval);
            }
        };
    }, [
        actions,
        actions2,
        checkCollisionCallback,
        displayAddIcon,
        hasSwappedAnimations,
        isAnimating,
        setActions,
        setActions2,
        sprite1Visible,
        sprite2Visible,
        sprite2,
        startActionsCallback
    ]);

    // Add CSS for better collision visualization
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .sprite-colliding {
                animation: collision-pulse 0.4s infinite;
                filter: brightness(1.3) contrast(1.2);
                box-shadow: 0 0 10px rgba(255,255,0,0.5);
            }
            @keyframes collision-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleSpriteSelect = (url) => {
        if (activeSprite === 1) {
            setSprite(url);
        } else {
            setSprite2(url);
        }
        setSpriteLibraryOpen(false);
    };

    const handleSpriteUpload = (dataUrl) => {
        if (activeSprite === 1) {
            setSprite(dataUrl);
        } else {
            setSprite2(dataUrl);
        }
        setSpriteLibraryOpen(false);
    };

    const handleSpriteDelete = () => {
        if (activeSprite === 1) {
            setSprite(require('../Assets/images/cat.png'));
        } else {
            setSprite2(null);
            setDisplayAddIcon(true);
        }
        setSpriteLibraryOpen(false);
    };

    const handleBackdropSelect = (url) => {
        setTheme(true);
        // Preload the image before setting it as background
        const img = new Image();
        img.onload = () => {
            const playArea = document.querySelector('.moves.play');
            if (playArea) {
                playArea.style.backgroundImage = `url(${url})`;
                playArea.style.backgroundSize = 'cover';
                playArea.style.backgroundPosition = 'center';
                playArea.style.backgroundRepeat = 'no-repeat';
            }
        };
        img.src = url;
        setBackdropLibraryOpen(false);
    };

    const handleBackdropUpload = (dataUrl) => {
        setTheme(true);
        const playArea = document.querySelector('.moves.play');
        if (playArea) {
            playArea.style.backgroundImage = `url(${dataUrl})`;
            playArea.style.backgroundSize = 'cover';
            playArea.style.backgroundPosition = 'center';
            playArea.style.backgroundRepeat = 'no-repeat';
        }
        setBackdropLibraryOpen(false);
    };

    const handleBackdropDelete = () => {
        setTheme(false);
        const playArea = document.querySelector('.moves.play');
        if (playArea) {
            playArea.style.backgroundImage = 'none';
            playArea.style.backgroundSize = 'auto';
            playArea.style.backgroundPosition = 'center';
            playArea.style.backgroundRepeat = 'no-repeat';
        }
        setBackdropLibraryOpen(false);
    };

    const checkAlignment = (draggedRect, otherRect) => {
        const guides = {
            vertical: { show: false, position: 0 },
            horizontal: { show: false, position: 0 }
        };

        // Check center alignment
        const draggedCenterX = draggedRect.left + draggedRect.width / 2;
        const otherCenterX = otherRect.left + otherRect.width / 2;
        const draggedCenterY = draggedRect.top + draggedRect.height / 2;
        const otherCenterY = otherRect.top + otherRect.height / 2;

        // Vertical center alignment
        if (Math.abs(draggedCenterX - otherCenterX) < ALIGNMENT_THRESHOLD) {
            guides.vertical = {
                show: true,
                position: otherCenterX
            };
        }

        // Horizontal center alignment
        if (Math.abs(draggedCenterY - otherCenterY) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = {
                show: true,
                position: otherCenterY
            };
        }

        // Edge alignments
        if (Math.abs(draggedRect.left - otherRect.left) < ALIGNMENT_THRESHOLD) {
            guides.vertical = {
                show: true,
                position: otherRect.left
            };
        }
        if (Math.abs(draggedRect.right - otherRect.right) < ALIGNMENT_THRESHOLD) {
            guides.vertical = {
                show: true,
                position: otherRect.right
            };
        }
        if (Math.abs(draggedRect.top - otherRect.top) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = {
                show: true,
                position: otherRect.top
            };
        }
        if (Math.abs(draggedRect.bottom - otherRect.bottom) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = {
                show: true,
                position: otherRect.bottom
            };
        }

        return guides;
    };

    const handleDragStop = () => {
        setAlignmentGuides({
            vertical: { show: false, position: 0 },
            horizontal: { show: false, position: 0 }
        });
    };

    useEffect(() => {
        // Initialize audio context on first user interaction
        const handleFirstInteraction = () => {
            initAudio();
            // Remove the event listeners after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    // Helper to push actions to the queue
    const pushActionToQueue = (spriteId, type, value, actionName, metadata = {}) => {
        if (isReplayingRef.current) {
            return;
        }
        setActionQueue(prev => [
            ...prev,
            {
                spriteId,
                type,
                value,
                actionName: actionName || value,
                ...metadata,
                timestamp: Date.now(),
            },
        ]);
    };

    const parseCoordinates = (value) => {
        if (!value) return null;
        const match = value.match(/\((-?\d+)\s*,\s*(-?\d+)\)/);
        if (!match) return null;
        return { x: match[1], y: match[2] };
    };

    const runReplayAction = (action) => {
        const actionName = action.actionName || action.value || action.type;
        const action1 = action.spriteId === 1;
        if (!actionName) return;

        switch (actionName) {
            case 'Move 50 steps':
                moveRight(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Move -50 steps':
                moveLeft(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Move up 50 steps':
                moveUp(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Move down 50 steps':
                moveDown(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'turn 45 degrees':
                rotate(45, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'turn 90 degrees':
                rotate(90, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'turn 135 degrees':
                rotate(135, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'turn 180 degrees':
                rotate(180, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'turn 360 degrees':
                rotate(360, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Go to coordinates': {
                const coords = parseCoordinates(action.value);
                if (coords) {
                    moveXY(coords.x, coords.y, false, IMMEDIATE_ACTION_INDEX, action1);
                }
                break;
            }
            case 'Set size small':
                handleScale('small', null, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Set size medium':
                handleScale('medium', null, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Set size large':
                handleScale('large', null, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'size increase':
                handleScale(null, true, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'size decrease':
                handleScale(null, false, IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Say Hello for 5 sec':
                sayHello(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Think Hmmm for 3 sec':
                thinkHmmm(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Say Bye':
                sayBye(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Say Hii':
                sayHii(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'Think See you':
                thinkSeeYou(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'show':
                showSprite(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'hide':
                hideSprite(IMMEDIATE_ACTION_INDEX, action1);
                break;
            case 'When flag clicked':
                announceEvent(action.value || 'Green flag clicked!', action1, 'When flag clicked');
                break;
            case 'Broadcast hello':
                announceEvent(action.value || 'Broadcast: hello!', action1, 'Broadcast hello');
                break;
            case 'Touching edge?':
                handleSensingResult('Touching edge', Boolean(action.result), action1, 'Touching edge?');
                break;
            case 'Touching sprite?':
                handleSensingResult('Touching sprite', Boolean(action.result), action1, 'Touching sprite?');
                break;
            case 'Pick random 1 to 10': {
                const result = typeof action.result === 'number'
                    ? action.result
                    : Math.floor(Math.random() * 10) + 1;
                handleOperatorResult('Random 1-10', result, action1, 'Pick random 1 to 10');
                break;
            }
            case 'Score + 5': {
                const result = typeof action.result === 'number'
                    ? action.result
                    : scoreRef.current + 5;
                handleOperatorResult('Score + 5', result, action1, 'Score + 5');
                break;
            }
            case 'Set score to 0': {
                const scoreValue = typeof action.score === 'number' ? action.score : 0;
                updateScore(scoreValue, action1, 'Set score to 0');
                break;
            }
            case 'Change score by 1': {
                if (typeof action.score === 'number') {
                    updateScore(action.score, action1, 'Change score by 1');
                } else {
                    updateScore((prevScore) => prevScore + 1, action1, 'Change score by 1');
                }
                break;
            }
            case 'Spin jump':
                runSpinJump(action1);
                break;
            case 'Wiggle':
                runWiggle(action1);
                break;
            default:
                break;
        }
    };

    // Function to handle replay
    const handleReplay = () => {
        if (actionQueue.length === 0) return;
        clearAllTimeouts();

        const previousAnimating = isAnimating;
        setIsAnimating(true);
        setIsReplaying(true);
        setReplayIndex(-1);
        isReplayingRef.current = true;

        actionQueue.forEach((action, index) => {
            safeSetTimeout(() => {
                setReplayIndex(index);
                runReplayAction(action);
            }, index * 1000); // 1 second delay between actions
        });

        // Reset after all actions are replayed
        safeSetTimeout(() => {
            setIsReplaying(false);
            setReplayIndex(-1);
            setIsAnimating(previousAnimating);
        }, actionQueue.length * 1000);
    };

    // Function to handle pause/resume
    const handlePauseResume = () => {
        if (isReplaying) {
            clearAllTimeouts();
            setIsReplaying(false);
            setReplayIndex(-1);
        } else {
            handleReplay();
        }
    };

    // Function to clear history
    const handleClearHistory = () => {
        setActionQueue([]);
        clearAllTimeouts();
        setIsReplaying(false);
        setReplayIndex(-1);
    };

    return (
        <div className='mainContainer'>
            <ToastContainer />
            <div className="container">
                <CategorySidebar 
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                />
                <Droppable droppableId="MovesList">
                    {(provided) => (
                        <div 
                            className="moves" 
                            ref={(el) => {
                                provided.innerRef(el);
                                if (el) movesContainerRef.current = el;
                            }}
                            {...provided.droppableProps}
                        >
                            <div className='moves__heading'>
                                Moves
                            </div>
                            {renderCategory('Motion', null, moves)}
                            {renderCategory('Looks', null, moves)}
                            {renderCategory('Sound', null, moves)}
                            {renderCategory('Control', null, moves)}
                            {renderCategory('Events', null, moves)}
                            {renderCategory('Sensing', null, moves)}
                            {renderCategory('Operators', null, moves)}
                            {renderCategory('Variables', null, moves)}
                            {renderCategory('My Blocks', null, moves)}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                <Droppable droppableId="MovesActions">
                    {(provided) => (
                    <div 
                        className="moves actions"
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                    >
                        <span className='moves__heading'>
                            Action
                        </span>
                         {actions?.map((move, index) => (
                            <SingleAction
                                index={index}
                                moves={actions}
                                move={move}
                                key={move.id}
                                refresh={refresh}
                                setMoves={setActions}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                    )}
                </Droppable>

                {!displayAddIcon && (
                    <Droppable droppableId="MovesActions2">
                        {(provided) => (
                            <div 
                                className="moves actions"
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                            >
                                <span className='moves__heading'>
                                    Action 2
                                </span>
                                {actions2?.map((move, index) => (
                                    <SingleAction
                                        index={index}
                                        moves={actions2}
                                        move={move}
                                        key={move.id}
                                        refresh={refresh}
                                        setMoves={setActions2}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )}

                <div className="moves play" 
                    style={{
                        background: theme ? 'none' : 'white',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        position: 'relative',
                        width: '100%'
                    }}
                >
                    {/* Collision Effects */}
                    {collisionEffects.ripple && (
                        <div 
                            className="collision-ripple"
                            style={{
                                left: collisionEffects.position.x,
                                top: collisionEffects.position.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                    {collisionEffects.soundWave && (
                        <div 
                            className="sound-wave"
                            style={{
                                left: collisionEffects.position.x,
                                top: collisionEffects.position.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            color: '#575e75'
                        }}
                    >
                        <div>Score: {score}</div>
                        <div>Result: {operatorResult ?? '--'}</div>
                    </div>
                    {collisionEffects.swapArrows && (
                        <div 
                            className="swap-arrows"
                            style={{
                                left: collisionEffects.position.x,
                                top: collisionEffects.position.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                    <AlignmentGuide 
                        show={alignmentGuides.vertical.show} 
                        position={alignmentGuides.vertical.position} 
                        type="vertical" 
                    />
                    <AlignmentGuide 
                        show={alignmentGuides.horizontal.show} 
                        position={alignmentGuides.horizontal.position} 
                        type="horizontal" 
                    />
                    <div style={{display:'flex', flexDirection:"row"}}> 
                        <Draggable1 bounds={{left: -540, top: -250, right:540, bottom:250}}
                            onDrag={(e, data) => handleDrag(e, data, true)}
                            onStop={handleDragStop}
                        >
                            <div ref={ref} style={{
                                position:'relative',
                                transition:'1s all ease',
                                visibility: sprite1Visible ? 'visible' : 'hidden'
                            }}
                                onMouseEnter={() => setActiveSprite(1)}
                            >
                            {hello ?
                                <div style={{transition:"0s all ease"}} className='msgPopup'>
                                    {currentAction === 'Say Hello for 5 sec' ? 'hello!' :
                                     currentAction === 'Say Bye' ? 'bye!' :
                                     currentAction === 'Say Hii' ? 'hii!' : ''}
                                </div>
                                : null
                            }
                            {think ?
                                <div style={{transition:"0s all ease"}} className='thinkPopup'>
                                    {currentAction === 'Think Hmmm for 3 sec' ? 'hmmm...' :
                                     currentAction === 'Think See you' ? 'see you...' : ''}
                                </div>
                                : null
                            }
                            <img 
                                src={sprite.toString()}
                                alt="Sprite 1"
                                draggable='false'
                                className={isColliding ? 'sprite-colliding' : ''}
                                style={{
                                    cursor:"pointer",
                                    position:'relative',
                                    height:200, 
                                    width:200,
                                    transition: '1s all ease'
                                }}
                            />
                            </div>
                        </Draggable1>
                        {!displayAddIcon && 
                        <Draggable1 bounds={{left: -540, top: -250, right:540, bottom:250}}
                            onDrag={(e, data) => handleDrag(e, data, false)}
                            onStop={handleDragStop}
                        >
                            <div ref={ref2} style={{
                                position:'relative',
                                transition:'1s all ease',
                                visibility: sprite2Visible ? 'visible' : 'hidden'
                            }}
                                onMouseEnter={() => setActiveSprite(2)}
                            >
                            {hello2 ?
                                <div style={{transition:"0s all ease"}} className='msgPopup'>
                                    {currentAction === 'Say Hello for 5 sec' ? 'hello!' :
                                     currentAction === 'Say Bye' ? 'bye!' :
                                     currentAction === 'Say Hii' ? 'hii!' : ''}
                                </div>
                                : null
                            }
                            {think2 ?
                                <div style={{transition:"0s all ease"}} className='thinkPopup'>
                                    {currentAction === 'Think Hmmm for 3 sec' ? 'hmmm...' :
                                     currentAction === 'Think See you' ? 'see you...' : ''}
                                </div>
                                : null
                            }
                            <img 
                                src={sprite2 ? sprite2.toString() : ''}
                                alt="Sprite 2" 
                                draggable='false'
                                className={isColliding ? 'sprite-colliding' : ''}
                                style={{
                                    cursor:"pointer",
                                    position:'relative',
                                    height:200, 
                                    width:200,
                                    transition: '1s all ease'
                                }}
                            />
                            </div>
                        </Draggable1>}
                    </div>
                    <div className="playground-toolbar" style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        <div className="icon">
                            <PlayArrowIcon sx={{color:'gray', cursor:'pointer', fontSize:'30px'}} onClick={handlePlay}/>
                            <span className="tooltiptext">play</span>
                        </div>
                        <div className="icon">
                            <RefreshIcon sx={{color:'gray', cursor:'pointer', fontSize:'30px'}} onClick={refresh}/>
                            <span className="tooltiptext">refresh</span>
                        </div>
                        <div><DeleteIcon onClick={()=>{setActions([]); setActions2([])}} sx={{cursor:'pointer', fontSize:'30px',color:'Grey'}}/></div>
                        <div className="icon">
                            {displayAddIcon ? (
                                <AddBoxIcon sx={{color:'gray', cursor:'pointer'}} onClick={()=>{
                                    setDisplayAddIcon(!displayAddIcon);
                                    setSprite2(jerryImage);
                                    refresh();
                                }}/>
                            ) : (
                                <DisabledByDefaultIcon sx={{color:'gray', cursor:'pointer'}} onClick={()=>{
                                    setDisplayAddIcon(!displayAddIcon);
                                    setSprite2(null);
                                    refresh();
                                }}/>
                            )}
                            <span className="tooltiptext">{displayAddIcon ? 'add sprite' : 'remove sprite'}</span>
                        </div>
                        <div className="icon">
                            <PetsIcon 
                                sx={{color:'gray', cursor:'pointer', fontSize:'30px'}} 
                                onClick={() => {
                                    setActiveSprite(displayAddIcon ? 1 : 2);
                                    setSpriteLibraryOpen(true);
                                }}
                            />
                            <span className="tooltiptext">sprite library</span>
                        </div>
                        <div className="icon">
                            <LandscapeIcon 
                                sx={{color:'gray', cursor:'pointer', fontSize:'30px'}} 
                                onClick={() => setBackdropLibraryOpen(true)}
                            />
                            <span className="tooltiptext">backdrop library</span>
                        </div>
                        <div className="icon">
                            <FaChartBar 
                                style={{ color: 'gray', cursor: 'pointer', fontSize: '30px' }} 
                                onClick={() => setShowAnalytics(true)}
                                title="View Analytics"
                            />
                            <span className="tooltiptext">analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            <LibraryModal 
                open={spriteLibraryOpen}
                onClose={() => setSpriteLibraryOpen(false)}
                type="sprite"
                onSelect={handleSpriteSelect}
                onUpload={handleSpriteUpload}
                onDelete={handleSpriteDelete}
                currentItem={activeSprite === 1 ? sprite : sprite2}
            />

            <LibraryModal 
                open={backdropLibraryOpen}
                onClose={() => setBackdropLibraryOpen(false)}
                type="backdrop"
                onSelect={handleBackdropSelect}
                onUpload={handleBackdropUpload}
                onDelete={handleBackdropDelete}
                currentItem={theme}
            />

            <AnalyticsDashboard
                open={showAnalytics}
                onClose={() => setShowAnalytics(false)}
                actionQueue={actionQueue}
            />

            <ActionHistoryFooter
                actionQueue={actionQueue}
                onReplay={handleReplay}
                onClear={handleClearHistory}
                onPauseResume={handlePauseResume}
                isReplaying={isReplaying}
                replayIndex={replayIndex}
                spriteFilter={spriteFilter}
                setSpriteFilter={setSpriteFilter}
            />
        </div>
    );
}
export default EventBody;
