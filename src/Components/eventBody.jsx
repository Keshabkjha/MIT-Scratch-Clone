import * as React from 'react';
import { SingleAction } from './singleAction';
import { Droppable } from '@hello-pangea/dnd';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const ALIGNMENT_THRESHOLD = 5; // pixels within which to show alignment guides
const STAGE_BOUNDARY_X = 290;
const STAGE_BOUNDARY_Y = 140;
const IMMEDIATE_ACTION_INDEX = 0;
const SPIN_JUMP_DELAY = 600;
const WIGGLE_ANGLE = 15;
const WIGGLE_SWING_ANGLE = -30;
const WIGGLE_STEP_DELAY = 300;
const WIGGLE_RETURN_DELAY = 600;
const MAX_REPEATS = 4; // bound the "repeat" block so it can't loop forever

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const createTransformState = () => ({ r: '0%', t: '0%', scale: 1, angle: 0 });

export const EventBody = (props) => {
    const {
        moves,
        setMoves,
        actions,
        setActions,
        setActions2,
        actions2,
        sprite,
        setSprite,
        sprite2,
        setSprite2,
        displayAddIcon,
        setDisplayAddIcon,
        theme,
        setTheme,
        backdropUrl,
        setBackdropUrl,
        currentVolume,
        setCurrentVolume
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

    // Transform state is kept in refs so it survives the frequent re-renders
    // that happen during an animation (previously these were plain `let`
    // variables that reset to 0 on every render, corrupting the motion math).
    const t1Ref = useRef(createTransformState());
    const t2Ref = useRef(createTransformState());
    const s1 = t1Ref.current;
    const s2 = t2Ref.current;

    const [hello, setHello] = React.useState(false);
    const [hello2, setHello2] = React.useState(false);
    const [think, setThink] = React.useState(false);
    const [think2, setThink2] = React.useState(false);
    const catImage = require('../Assets/images/cat.png');
    const jerryImage = require('../Assets/images/jerry1.png');
    const [activeSprite, setActiveSprite] = React.useState(1); // 1 for first sprite, 2 for second sprite
    const [currentAction, setCurrentAction] = React.useState('');
    // Ref mirror of currentAction so delayed cleanup timers read the latest
    // value instead of a stale closure captured when they were scheduled.
    const currentActionRef = useRef('');

    const [isAnimating, setIsAnimating] = React.useState(false);
    const isAnimatingRef = useRef(false);
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

    const [actionQueue, setActionQueue] = React.useState([]);
    const [isReplaying, setIsReplaying] = React.useState(false);
    const isReplayingRef = useRef(false);
    const [replayIndex, setReplayIndex] = React.useState(-1);
    const [spriteFilter, setSpriteFilter] = React.useState('all');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [score, setScore] = React.useState(0);
    const [operatorResult, setOperatorResult] = React.useState(null);
    const scoreRef = useRef(score);

    // Coordinate input dialog (accessible replacement for window.prompt)
    const [coordDialogOpen, setCoordDialogOpen] = React.useState(false);
    const [coordInput, setCoordInput] = React.useState({ x: '0', y: '0' });
    const coordsRef = useRef({ x: 0, y: 0 });
    const coordsProvidedRef = useRef(false);
    const pendingPlayRef = useRef(false);

    // Bound for the repeat block
    const repeatCountRef = useRef(0);

    // Refs mirroring volatile state used inside the collision interval, so the
    // interval effect does not need to tear down/recreate on every change.
    const actionsRef = useRef(actions);
    const actions2Ref = useRef(actions2);
    const hasSwappedRef = useRef(false);
    const sprite1VisibleRef = useRef(true);
    const sprite2VisibleRef = useRef(true);

    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { isReplayingRef.current = isReplaying; }, [isReplaying]);
    useEffect(() => { actionsRef.current = actions; }, [actions]);
    useEffect(() => { actions2Ref.current = actions2; }, [actions2]);
    useEffect(() => { hasSwappedRef.current = hasSwappedAnimations; }, [hasSwappedAnimations]);
    useEffect(() => { sprite1VisibleRef.current = sprite1Visible; }, [sprite1Visible]);
    useEffect(() => { sprite2VisibleRef.current = sprite2Visible; }, [sprite2Visible]);

    const setAnimating = useCallback((value) => {
        isAnimatingRef.current = value;
        setIsAnimating(value);
    }, []);

    const updateCurrentAction = useCallback((value) => {
        currentActionRef.current = value;
        setCurrentAction(value);
    }, []);

    useEffect(() => {
        const container = movesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const categories = Array.from(container.getElementsByClassName('moves__category'));
            const containerHeight = container.clientHeight;

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

    const applyTransform = (action1) => {
        const node = action1 ? ref.current : ref2.current;
        const s = action1 ? s1 : s2;
        if (node) {
            node.style.transform = `scale(${s.scale}) translate(${s.r}, ${s.t}) rotate(${s.angle}deg)`;
        }
    };

    function transform(temp, xAxis, action1) {
        if (!isAnimatingRef.current) return;
        const value = temp.toString();
        const s = action1 ? s1 : s2;
        if (xAxis) {
            s.r = value.concat('%');
        } else {
            s.t = value.concat('%');
        }
        applyTransform(action1);
    }

    function moveUp(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'move', '-50 steps', 'Move up 50 steps');
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            let temp = parseInt(s.t.slice(0, -1), 10) - 50;
            if (temp < -140) {
                refresh(WARN_MSG_POS);
                return;
            }
            transform(temp, false, action1);
        }, i * 1500);
    }
    function moveDown(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'move', '50 steps', 'Move down 50 steps');
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            let temp = parseInt(s.t.slice(0, -1), 10) + 50;
            if (temp > 140) {
                refresh(WARN_MSG_POS);
                return;
            }
            transform(temp, false, action1);
        }, i * 1500);
    }
    function moveRight(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'move', '50 steps', 'Move 50 steps');
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            let temp = parseInt(s.r.slice(0, -1), 10) + 50;
            if (temp > 290) {
                refresh(WARN_MSG_POS);
                return;
            }
            transform(temp, true, action1);
        }, i * 1500);
    }
    function moveLeft(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'move', '-50 steps', 'Move -50 steps');
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            let temp = parseInt(s.r.slice(0, -1), 10) - 50;
            if (temp < -290) {
                refresh(WARN_MSG_POS);
                return;
            }
            transform(temp, true, action1);
        }, i * 1500);
    }
    function sayHello(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Hello', 'Say Hello for 5 sec');
        safeSetTimeout(() => {
            updateCurrentAction('Say Hello for 5 sec');
            action1 ? setHello(true) : setHello2(true);
        }, i * 1500);
        safeSetTimeout(() => {
            if (currentActionRef.current === 'Say Hello for 5 sec') {
                action1 ? setHello(false) : setHello2(false);
                updateCurrentAction('');
            }
        }, (i * 1500) + 5000);
    }

    function thinkHmmm(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'think', 'Hmmm', 'Think Hmmm for 3 sec');
        safeSetTimeout(() => {
            updateCurrentAction('Think Hmmm for 3 sec');
            action1 ? setThink(true) : setThink2(true);
        }, i * 1500);
        safeSetTimeout(() => {
            if (currentActionRef.current === 'Think Hmmm for 3 sec') {
                action1 ? setThink(false) : setThink2(false);
                updateCurrentAction('');
            }
        }, (i * 1500) + 3000);
    }

    function sayBye(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Bye', 'Say Bye');
        safeSetTimeout(() => {
            updateCurrentAction('Say Bye');
            setHello(false);
            setHello2(false);
            if (hasSwappedRef.current) {
                action1 ? setHello2(true) : setHello(true);
            } else {
                action1 ? setHello(true) : setHello2(true);
            }
        }, (i * 1500));
        safeSetTimeout(() => {
            if (currentActionRef.current === 'Say Bye') {
                setHello(false);
                setHello2(false);
                updateCurrentAction('');
            }
        }, (i * 1500) + 2000);
    }

    function sayHii(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'say', 'Hii', 'Say Hii');
        safeSetTimeout(() => {
            updateCurrentAction('Say Hii');
            setHello(false);
            setHello2(false);
            if (hasSwappedRef.current) {
                action1 ? setHello2(true) : setHello(true);
            } else {
                action1 ? setHello(true) : setHello2(true);
            }
        }, (i * 1500));
        safeSetTimeout(() => {
            if (currentActionRef.current === 'Say Hii') {
                setHello(false);
                setHello2(false);
                updateCurrentAction('');
            }
        }, (i * 1500) + 2000);
    }

    function thinkSeeYou(i, action1) {
        pushActionToQueue(action1 ? 1 : 2, 'think', 'See you', 'Think See you');
        safeSetTimeout(() => {
            updateCurrentAction('Think See you');
            setThink(false);
            setThink2(false);
            if (hasSwappedRef.current) {
                action1 ? setThink2(true) : setThink(true);
            } else {
                action1 ? setThink(true) : setThink2(true);
            }
        }, (i * 1500));
        safeSetTimeout(() => {
            if (currentActionRef.current === 'Think See you') {
                setThink(false);
                setThink2(false);
                updateCurrentAction('');
            }
        }, (i * 1500) + 2000);
    }

    function moveXY(xInput, yInput, random, i, action1) {
        const actionName = random ? 'Go to random position' : 'Go to coordinates';
        pushActionToQueue(action1 ? 1 : 2, 'move', `(${xInput}, ${yInput})`, actionName);
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            let tempR = parseInt(s.r.slice(0, -1), 10);
            let tempT = parseInt(s.t.slice(0, -1), 10);
            tempR = tempR !== parseInt(xInput, 10) && parseInt(xInput, 10) !== 0
                ? (random ? Math.floor((Math.random() * (-290 - 290)) + 290) : parseInt(xInput, 10))
                : tempR;
            tempT = tempT !== (-parseInt(yInput, 10)) && parseInt(yInput, 10) !== 0
                ? (random ? Math.floor((Math.random() * (-140 - 140)) + 140) : -parseInt(yInput, 10))
                : tempT;
            if (parseInt(yInput, 10) === 0) {
                tempT = 0;
            }
            if (parseInt(xInput, 10) === 0) {
                tempR = 0;
            }
            if (tempR < -290 || tempR > 290 || tempT < -140 || tempT > 140) {
                refresh(WARN_MSG_POS);
                return;
            }
            s.r = tempR.toString().concat('%');
            s.t = tempT.toString().concat('%');
            applyTransform(action1);
        }, (i * 1500));
    }
    const rotate = (rAngle, i, action1) => {
        pushActionToQueue(action1 ? 1 : 2, 'turn', `${rAngle} degrees`, `turn ${rAngle} degrees`);
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            s.angle += rAngle;
            applyTransform(action1);
        }, (i * 1500));
    }
    function handleScale(size, increase, idx, action1) {
        // If size is provided, we're using the Resize/library control
        if (size) {
            const isFirstSprite = activeSprite === 1;
            const newScale = size === 'medium' ? 2 : (size === 'large' ? 3 : 1);
            const sizeLabel = size === 'medium' ? 'Set size medium' : (size === 'large' ? 'Set size large' : 'Set size small');
            pushActionToQueue(isFirstSprite ? 1 : 2, 'scale', size, sizeLabel);
            if (isFirstSprite) {
                s1.scale = newScale;
                applyTransform(true);
            } else if (sprite2) {
                s2.scale = newScale;
                applyTransform(false);
            }
            return;
        }

        // Otherwise we're using the increase/decrease action items
        if (increase) {
            pushActionToQueue(action1 ? 1 : 2, 'scale', 'increase', 'size increase');
            safeSetTimeout(() => {
                const s = action1 ? s1 : s2;
                s.scale += 0.2;
                if (s.scale < 3) {
                    applyTransform(action1);
                } else {
                    refresh(WARN_MSG_SIZE);
                }
            }, idx * 1500);
            return;
        }
        pushActionToQueue(action1 ? 1 : 2, 'scale', 'decrease', 'size decrease');
        safeSetTimeout(() => {
            const s = action1 ? s1 : s2;
            s.scale -= 0.2;
            if (s.scale > 0.5) {
                applyTransform(action1);
            } else {
                refresh(WARN_MSG_SIZE);
            }
        }, idx * 1500);
    }

    function showSprite(i, action1) {
        if (!isAnimatingRef.current) return;
        safeSetTimeout(() => {
            if (action1) {
                setSprite1Visible(true);
                if (ref.current) ref.current.style.visibility = 'visible';
            } else {
                setSprite2Visible(true);
                if (ref2.current) ref2.current.style.visibility = 'visible';
            }
        }, i * 1500);
    }

    function hideSprite(i, action1) {
        if (!isAnimatingRef.current) return;
        safeSetTimeout(() => {
            if (action1) {
                setSprite1Visible(false);
                if (ref.current) ref.current.style.visibility = 'hidden';
            } else {
                setSprite2Visible(false);
                if (ref2.current) ref2.current.style.visibility = 'hidden';
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
        if (!isAnimatingRef.current) return;
        const delay = idx * 1500;

        switch (action) {
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
                const { x, y } = coordsRef.current;
                safeSetTimeout(() => moveXY(x, y, false, idx, action1), delay);
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
                    actionsRef.current?.length || 0,
                    actions2Ref.current?.length || 0
                ) * 1500;

                safeSetTimeout(() => {
                    if (!isAnimatingRef.current) return;
                    if (repeatCountRef.current >= MAX_REPEATS) return;
                    repeatCountRef.current += 1;
                    // Re-run both sprite scripts after the current pass finishes.
                    safeSetTimeout(() => {
                        if (!isAnimatingRef.current) return;
                        runAction1();
                        runAction2();
                    }, maxDelay);
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
                    playSound('pop', newVolume);
                }, delay);
                break;
            }
            case 'Decrease Volume': {
                safeSetTimeout(() => {
                    const newVolume = Math.max(currentVolume - 0.2, 0);
                    setCurrentVolume(newVolume);
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
                    const s = action1 ? s1 : s2;
                    const currentX = parseInt(s.r, 10);
                    const currentY = parseInt(s.t, 10);
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

        setTimeout(() => {
            setCollisionEffects({
                ripple: false,
                soundWave: false,
                swapArrows: false,
                position: { x: 0, y: 0 }
            });
        }, 1000);
    };

    // Shared swap routine used by both manual-drag collisions and the polling
    // interval. Reads volatile state from refs so it has no stale closures.
    const performSwap = () => {
        if (hasSwappedRef.current) return;
        const a1 = actionsRef.current || [];
        const a2 = actions2Ref.current || [];
        if (!(a1.length > 0 && a2.length > 0)) return;

        clearAllTimeouts();
        setAnimating(false);

        setHello(false);
        setHello2(false);
        setThink(false);
        setThink2(false);
        updateCurrentAction('');

        const tempActions = [...a1];
        const tempActions2 = [...a2];
        const v1 = sprite1VisibleRef.current;
        const v2 = sprite2VisibleRef.current;

        setActions(tempActions2);
        setActions2(tempActions);
        setSprite1Visible(v2);
        setSprite2Visible(v1);

        setHasSwappedAnimations(true);
        hasSwappedRef.current = true;

        toast.info("Sprites collided! Animations swapped!", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        safeSetTimeout(() => {
            setAnimating(true);
            tempActions2.forEach((item, i) => startActionsCallback(item.todo, i, true));
            tempActions.forEach((item, i) => startActionsCallback(item.todo, i, false));
        }, 500);
    };

    actionHandlersRef.current.performSwap = performSwap;

    // Enhanced collision detection (manual dragging)
    const handleCollision = (draggedRect) => {
        const collision = checkCollisionCallback();
        if (collision && !isColliding) {
            setIsColliding(true);
            if (!hasSwappedRef.current) {
                const x = (draggedRect.left + draggedRect.right) / 2;
                const y = (draggedRect.top + draggedRect.bottom) / 2;
                createCollisionEffects(x, y);

                if (window.navigator.vibrate) {
                    window.navigator.vibrate(100);
                }

                performSwap();
            }
        } else if (!collision && isColliding) {
            setIsColliding(false);
        }
    };

    const handleDrag = (e, data, isFirstSprite) => {
        const draggedRef = isFirstSprite ? ref.current : ref2.current;
        const otherRef = isFirstSprite ? ref2.current : ref.current;

        if (draggedRef && otherRef && !displayAddIcon) {
            const draggedRect = draggedRef.getBoundingClientRect();
            const otherRect = otherRef.getBoundingClientRect();

            handleCollision(draggedRect);

            const guides = checkAlignment(draggedRect, otherRect);
            setAlignmentGuides(guides);
        }
    };

    // Function to check collision between two sprites
    const checkCollision = () => {
        if (!ref.current || !ref2.current || !sprite2) return false;

        const rect1 = ref.current.getBoundingClientRect();
        const rect2 = ref2.current.getBoundingClientRect();

        const sprite1Width = rect1.width * 0.7;
        const sprite1Height = rect1.height * 0.7;
        const sprite2Width = rect2.width * 0.7;
        const sprite2Height = rect2.height * 0.7;

        const center1X = rect1.left + rect1.width / 2;
        const center1Y = rect1.top + rect1.height / 2;
        const center2X = rect2.left + rect2.width / 2;
        const center2Y = rect2.top + rect2.height / 2;

        const distanceX = Math.abs(center1X - center2X);
        const distanceY = Math.abs(center1Y - center2Y);

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

    const startPlay = () => {
        initAudio();

        clearAllTimeouts();
        setAnimating(false);
        setIsColliding(false);
        setHasSwappedAnimations(false);
        hasSwappedRef.current = false;
        repeatCountRef.current = 0;
        setHello(false);
        setHello2(false);
        setThink(false);
        setThink2(false);
        updateCurrentAction('');

        // Reset transforms
        t1Ref.current = createTransformState();
        t2Ref.current = createTransformState();
        if (ref.current) {
            ref.current.style.transform = `scale(1) translate(0%, 0%) rotate(0deg)`;
        }
        if (ref2.current) {
            ref2.current.style.transform = `scale(1) translate(0%, 0%) rotate(0deg)`;
        }

        setAnimating(true);

        if (actions?.length) {
            actions.forEach((item, i) => startActionsCallback(item.todo, i, true));
        }
        if (!displayAddIcon && actions2?.length) {
            actions2.forEach((item, i) => startActionsCallback(item.todo, i, false));
        }
    };

    const handlePlay = () => {
        const needsCoords = (actions?.some(a => a.todo === 'Go to coordinates'))
            || (!displayAddIcon && actions2?.some(a => a.todo === 'Go to coordinates'));
        if (needsCoords && !coordsProvidedRef.current) {
            pendingPlayRef.current = true;
            setCoordDialogOpen(true);
            return;
        }
        startPlay();
    };

    const handleCoordSubmit = () => {
        const x = clamp(parseInt(coordInput.x, 10) || 0, -290, 290);
        const y = clamp(parseInt(coordInput.y, 10) || 0, -140, 140);
        coordsRef.current = { x, y };
        coordsProvidedRef.current = true;
        setCoordDialogOpen(false);
        if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            startPlay();
        }
    };

    const handleCoordCancel = () => {
        pendingPlayRef.current = false;
        setCoordDialogOpen(false);
    };

    const refresh = (msg) => {
        clearAllTimeouts();
        setAnimating(false);
        setIsColliding(false);
        setHasSwappedAnimations(false);
        hasSwappedRef.current = false;
        repeatCountRef.current = 0;
        coordsProvidedRef.current = false;
        updateCurrentAction('');
        setHello(false);
        setHello2(false);
        setThink(false);
        setThink2(false);
        setSprite1Visible(true);
        setSprite2Visible(true);

        // Reset transforms
        t1Ref.current = createTransformState();
        t2Ref.current = createTransformState();
        if (ref.current) {
            ref.current.style.transform = `scale(1) translate(0%, 0%) rotate(0deg)`;
            ref.current.style.visibility = 'visible';
        }
        if (ref2.current) {
            ref2.current.style.transform = `scale(1) translate(0%, 0%) rotate(0deg)`;
            ref2.current.style.visibility = 'visible';
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

    // Functions to start the actions for each sprite
    function runAction1() {
        if (actionsRef.current?.length) {
            actionsRef.current.forEach((item, i) => {
                startActionsCallback(item.todo, i, true);
            });
        }
    }

    function runAction2() {
        if (!displayAddIcon && actions2Ref.current?.length) {
            actions2Ref.current.forEach((item, i) => {
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

    const renderCategory = (categoryName, color, moveList) => {
        const categoryMoves = moveList?.filter(move => move.category === categoryName);
        if (!categoryMoves || categoryMoves.length === 0) return null;

        return (
            <div className="moves__category" data-category={categoryName}>
                <div className="category__heading">
                    {categoryName}
                </div>
                {categoryMoves.map((move) => (
                    <SingleAction
                        disableDelete={true}
                        index={moveList.findIndex(m => m.id === move.id)}
                        moves={moveList}
                        move={move}
                        key={move.id}
                        setMoves={setMoves}
                    />
                ))}
            </div>
        );
    };

    // Poll for collisions while animating. Volatile values are read from refs,
    // so this effect only re-subscribes when the sprite count actually changes.
    useEffect(() => {
        if (displayAddIcon || !sprite2) return undefined;

        let lastCollisionState = false;
        const collisionInterval = setInterval(() => {
            if (!isAnimatingRef.current) return;
            if (!ref.current || !ref2.current) return;

            const collision = checkCollisionCallback();
            if (collision !== lastCollisionState) {
                lastCollisionState = collision;
                if (collision) {
                    setIsColliding(true);
                    const swap = actionHandlersRef.current.performSwap;
                    if (swap) swap();
                } else {
                    setIsColliding(false);
                }
            }
        }, 100);

        return () => clearInterval(collisionInterval);
    }, [displayAddIcon, sprite2, checkCollisionCallback]);

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
            setSprite(catImage);
        } else {
            setSprite2(null);
            setDisplayAddIcon(true);
        }
        setSpriteLibraryOpen(false);
    };

    const handleBackdropSelect = (url) => {
        setTheme(true);
        setBackdropUrl(url);
        setBackdropLibraryOpen(false);
    };

    const handleBackdropUpload = (dataUrl) => {
        setTheme(true);
        setBackdropUrl(dataUrl);
        setBackdropLibraryOpen(false);
    };

    const handleBackdropDelete = () => {
        setTheme(false);
        setBackdropUrl(null);
        setBackdropLibraryOpen(false);
    };

    const checkAlignment = (draggedRect, otherRect) => {
        const guides = {
            vertical: { show: false, position: 0 },
            horizontal: { show: false, position: 0 }
        };

        const draggedCenterX = draggedRect.left + draggedRect.width / 2;
        const otherCenterX = otherRect.left + otherRect.width / 2;
        const draggedCenterY = draggedRect.top + draggedRect.height / 2;
        const otherCenterY = otherRect.top + otherRect.height / 2;

        if (Math.abs(draggedCenterX - otherCenterX) < ALIGNMENT_THRESHOLD) {
            guides.vertical = { show: true, position: otherCenterX };
        }
        if (Math.abs(draggedCenterY - otherCenterY) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = { show: true, position: otherCenterY };
        }
        if (Math.abs(draggedRect.left - otherRect.left) < ALIGNMENT_THRESHOLD) {
            guides.vertical = { show: true, position: otherRect.left };
        }
        if (Math.abs(draggedRect.right - otherRect.right) < ALIGNMENT_THRESHOLD) {
            guides.vertical = { show: true, position: otherRect.right };
        }
        if (Math.abs(draggedRect.top - otherRect.top) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = { show: true, position: otherRect.top };
        }
        if (Math.abs(draggedRect.bottom - otherRect.bottom) < ALIGNMENT_THRESHOLD) {
            guides.horizontal = { show: true, position: otherRect.bottom };
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
        const handleFirstInteraction = () => {
            initAudio();
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

    // Clean up any pending timers when the component unmounts.
    useEffect(() => () => clearAllTimeouts(), []);

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
        return { x: Number(match[1]), y: Number(match[2]) };
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
                if (typeof action.result !== 'boolean') return;
                handleSensingResult('Touching edge', action.result, action1, 'Touching edge?');
                break;
            case 'Touching sprite?':
                if (typeof action.result !== 'boolean') return;
                handleSensingResult('Touching sprite', action.result, action1, 'Touching sprite?');
                break;
            case 'Pick random 1 to 10': {
                if (typeof action.result !== 'number') return;
                handleOperatorResult('Random 1-10', action.result, action1, 'Pick random 1 to 10');
                break;
            }
            case 'Score + 5': {
                if (typeof action.result !== 'number') return;
                handleOperatorResult('Score + 5', action.result, action1, 'Score + 5');
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

        const wasAnimatingBeforeReplay = isAnimatingRef.current;
        setAnimating(true);
        setIsReplaying(true);
        setReplayIndex(-1);
        isReplayingRef.current = true;

        actionQueue.forEach((action, index) => {
            safeSetTimeout(() => {
                setReplayIndex(index);
                runReplayAction(action);
            }, index * 1000);
        });

        safeSetTimeout(() => {
            setIsReplaying(false);
            setReplayIndex(-1);
            isReplayingRef.current = false;
            setAnimating(wasAnimatingBeforeReplay);
        }, actionQueue.length * 1000);
    };

    const handlePauseResume = () => {
        if (isReplaying) {
            clearAllTimeouts();
            setIsReplaying(false);
            setReplayIndex(-1);
            isReplayingRef.current = false;
        } else {
            handleReplay();
        }
    };

    const handleClearHistory = () => {
        setActionQueue([]);
        clearAllTimeouts();
        setIsReplaying(false);
        setReplayIndex(-1);
        isReplayingRef.current = false;
    };

    return (
        <div className='mainContainer'>
            <ToastContainer />
            <div className="container">
                <CategorySidebar
                    activeCategory={activeCategory}
                    onCategoryClick={handleCategoryClick}
                />
                <Droppable droppableId="MovesList" isDropDisabled={true}>
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
                        backgroundImage: theme && backdropUrl ? `url(${backdropUrl})` : 'none',
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
                    <div style={{ display: 'flex', flexDirection: "row" }}>
                        <Draggable1 bounds={{ left: -540, top: -250, right: 540, bottom: 250 }}
                            onDrag={(e, data) => handleDrag(e, data, true)}
                            onStop={handleDragStop}
                        >
                            <div ref={ref} style={{
                                position: 'relative',
                                transition: '1s all ease',
                                visibility: sprite1Visible ? 'visible' : 'hidden'
                            }}
                                onMouseEnter={() => setActiveSprite(1)}
                            >
                                {hello ?
                                    <div style={{ transition: "0s all ease" }} className='msgPopup'>
                                        {currentAction === 'Say Hello for 5 sec' ? 'hello!' :
                                            currentAction === 'Say Bye' ? 'bye!' :
                                                currentAction === 'Say Hii' ? 'hii!' : ''}
                                    </div>
                                    : null
                                }
                                {think ?
                                    <div style={{ transition: "0s all ease" }} className='thinkPopup'>
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
                                        cursor: "pointer",
                                        position: 'relative',
                                        height: 200,
                                        width: 200,
                                        transition: '1s all ease'
                                    }}
                                />
                            </div>
                        </Draggable1>
                        {!displayAddIcon &&
                            <Draggable1 bounds={{ left: -540, top: -250, right: 540, bottom: 250 }}
                                onDrag={(e, data) => handleDrag(e, data, false)}
                                onStop={handleDragStop}
                            >
                                <div ref={ref2} style={{
                                    position: 'relative',
                                    transition: '1s all ease',
                                    visibility: sprite2Visible ? 'visible' : 'hidden'
                                }}
                                    onMouseEnter={() => setActiveSprite(2)}
                                >
                                    {hello2 ?
                                        <div style={{ transition: "0s all ease" }} className='msgPopup'>
                                            {currentAction === 'Say Hello for 5 sec' ? 'hello!' :
                                                currentAction === 'Say Bye' ? 'bye!' :
                                                    currentAction === 'Say Hii' ? 'hii!' : ''}
                                        </div>
                                        : null
                                    }
                                    {think2 ?
                                        <div style={{ transition: "0s all ease" }} className='thinkPopup'>
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
                                            cursor: "pointer",
                                            position: 'relative',
                                            height: 200,
                                            width: 200,
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
                        <button type="button" className="icon toolbar-button" onClick={handlePlay} aria-label="Play actions">
                            <PlayArrowIcon sx={{ color: 'gray', fontSize: '30px' }} />
                            <span className="tooltiptext">play</span>
                        </button>
                        <button type="button" className="icon toolbar-button" onClick={() => refresh()} aria-label="Reset stage">
                            <RefreshIcon sx={{ color: 'gray', fontSize: '30px' }} />
                            <span className="tooltiptext">refresh</span>
                        </button>
                        <button
                            type="button"
                            className="toolbar-button"
                            onClick={() => { setActions([]); setActions2([]); }}
                            aria-label="Clear all action blocks"
                        >
                            <DeleteIcon sx={{ fontSize: '30px', color: 'Grey' }} />
                        </button>
                        <button
                            type="button"
                            className="icon toolbar-button"
                            aria-label={displayAddIcon ? 'Add second sprite' : 'Remove second sprite'}
                            onClick={() => {
                                if (displayAddIcon) {
                                    setDisplayAddIcon(false);
                                    setSprite2(jerryImage);
                                } else {
                                    setDisplayAddIcon(true);
                                    setSprite2(null);
                                }
                                refresh();
                            }}
                        >
                            {displayAddIcon ? (
                                <AddBoxIcon sx={{ color: 'gray' }} />
                            ) : (
                                <DisabledByDefaultIcon sx={{ color: 'gray' }} />
                            )}
                            <span className="tooltiptext">{displayAddIcon ? 'add sprite' : 'remove sprite'}</span>
                        </button>
                        <button
                            type="button"
                            className="icon toolbar-button"
                            aria-label="Open sprite library"
                            onClick={() => {
                                setActiveSprite(displayAddIcon ? 1 : 2);
                                setSpriteLibraryOpen(true);
                            }}
                        >
                            <PetsIcon sx={{ color: 'gray', fontSize: '30px' }} />
                            <span className="tooltiptext">sprite library</span>
                        </button>
                        <button
                            type="button"
                            className="icon toolbar-button"
                            aria-label="Open backdrop library"
                            onClick={() => setBackdropLibraryOpen(true)}
                        >
                            <LandscapeIcon sx={{ color: 'gray', fontSize: '30px' }} />
                            <span className="tooltiptext">backdrop library</span>
                        </button>
                        <button
                            type="button"
                            className="icon toolbar-button"
                            aria-label="View analytics"
                            onClick={() => setShowAnalytics(true)}
                        >
                            <FaChartBar style={{ color: 'gray', fontSize: '30px' }} />
                            <span className="tooltiptext">analytics</span>
                        </button>
                    </div>
                </div>
            </div>

            <Dialog open={coordDialogOpen} onClose={handleCoordCancel} aria-labelledby="coord-dialog-title">
                <DialogTitle id="coord-dialog-title">Go to coordinates</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <TextField
                            label="X (-290 to 290)"
                            type="number"
                            value={coordInput.x}
                            onChange={(e) => setCoordInput((prev) => ({ ...prev, x: e.target.value }))}
                            autoFocus
                        />
                        <TextField
                            label="Y (-140 to 140)"
                            type="number"
                            value={coordInput.y}
                            onChange={(e) => setCoordInput((prev) => ({ ...prev, y: e.target.value }))}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCoordCancel}>Cancel</Button>
                    <Button onClick={handleCoordSubmit} variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>

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
