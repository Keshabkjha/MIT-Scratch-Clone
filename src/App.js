import React, { useCallback, useEffect, useMemo, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { EventBody } from './Components/eventBody'
import { NavBar } from './Components/navBar';
import { DragDropContext } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { moves as initialMoves } from "./data/moves";
import useProjectPersistence, { CURRENT_PROJECT_VERSION } from './hooks/useProjectPersistence';

const CAT_IMAGE = require('./Assets/images/cat.png');

const reorder = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function App() {
  const [moves, setMoves] = useState(initialMoves);
  const [actions, setActions] = useState([]);
  const [actions2, setActions2] = useState([]);
  const [projectName, setProjectName] = useState('Scratch Project');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('success');
  const [toastOpen, setToastOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Stage / sprite state lifted here so it can be persisted with the project.
  const [sprite, setSprite] = useState(CAT_IMAGE);
  const [sprite2, setSprite2] = useState(null);
  const [displayAddIcon, setDisplayAddIcon] = useState(true);
  const [theme, setTheme] = useState(false);
  const [backdropUrl, setBackdropUrl] = useState(null);
  const [currentVolume, setCurrentVolume] = useState(1);

  const defaultProjectState = useMemo(() => ({
    version: CURRENT_PROJECT_VERSION,
    data: {
      blocks: initialMoves,
      scripts: { actions: [], actions2: [] },
      sprites: [CAT_IMAGE, null],
      stage: { theme: false, backdropUrl: null },
      variables: {},
      positions: {},
      costumes: [],
      sounds: [],
      settings: { displayAddIcon: true, currentVolume: 1 }
    },
    metadata: {
      name: 'Untitled',
      lastSaved: null
    }
  }), []);

  const projectState = useMemo(() => ({
    version: CURRENT_PROJECT_VERSION,
    data: {
      blocks: moves,
      scripts: { actions, actions2 },
      sprites: [sprite, sprite2],
      stage: { theme, backdropUrl },
      variables: {},
      positions: {},
      costumes: [],
      sounds: [],
      settings: { displayAddIcon, currentVolume }
    },
    metadata: {
      name: projectName,
      lastSaved: null
    }
  }), [moves, actions, actions2, projectName, sprite, sprite2, theme, backdropUrl, displayAddIcon, currentVolume]);

  const { saveProject, loadProject, exportProject, importProject } = useProjectPersistence({
    projectState,
    fallbackState: defaultProjectState,
    onSave: (state) => setLastSavedAt(state?.metadata?.lastSaved || null)
  });

  const applyProjectState = useCallback((state) => {
    if (!state?.data) {
      return;
    }
    setMoves(state.data.blocks || initialMoves);
    setActions(state.data.scripts?.actions || []);
    setActions2(state.data.scripts?.actions2 || []);

    const sprites = Array.isArray(state.data.sprites) ? state.data.sprites : [];
    setSprite(sprites[0] || CAT_IMAGE);
    setSprite2(sprites[1] || null);

    const stage = state.data.stage || {};
    setTheme(Boolean(stage.theme));
    setBackdropUrl(stage.backdropUrl || null);

    const settings = state.data.settings || {};
    setDisplayAddIcon(settings.displayAddIcon !== undefined ? settings.displayAddIcon : !sprites[1]);
    setCurrentVolume(typeof settings.currentVolume === 'number' ? settings.currentVolume : 1);

    if (state.metadata?.name) {
      setProjectName(state.metadata.name);
    }
    if (state.metadata?.lastSaved) {
      setLastSavedAt(state.metadata.lastSaved);
    }
  }, []);

  const handleStatus = useCallback((message, type = 'success') => {
    setStatusMessage(message);
    setStatusType(type);
    setToastOpen(true);
  }, []);

  const formatSavedAt = useCallback((value) => {
    if (!value) {
      return 'Not saved yet';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not saved yet';
    }
    const datePart = date.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Saved ${datePart}, ${timePart}`;
  }, []);

  const handleSave = useCallback(() => {
    const result = saveProject();
    if (result.ok) {
      handleStatus('Project saved successfully.');
    } else {
      handleStatus(`Save failed: ${result.error?.message || 'Unknown error'}.`, 'error');
    }
  }, [saveProject, handleStatus]);

  const handleLoad = useCallback(() => {
    const result = loadProject();
    if (result.ok) {
      applyProjectState(result.state);
      handleStatus('Project loaded from local storage.');
    } else {
      handleStatus(`Load failed: ${result.error?.message || 'Unknown error'}.`, 'error');
    }
  }, [applyProjectState, loadProject, handleStatus]);

  const handleExport = useCallback(() => {
    const result = exportProject();
    if (result.ok) {
      handleStatus('Project exported as JSON.');
    } else {
      handleStatus(`Export failed: ${result.error?.message || 'Unknown error'}.`, 'error');
    }
  }, [exportProject, handleStatus]);

  const handleImport = useCallback(async (file) => {
    const result = await importProject(file);
    if (result.ok) {
      applyProjectState(result.state);
      saveProject(result.state);
      handleStatus('Project imported successfully.');
    } else {
      handleStatus(`Import failed: ${result.error?.message || 'Unknown error'}.`, 'error');
    }
  }, [applyProjectState, importProject, saveProject, handleStatus]);

  useEffect(() => {
    const result = loadProject();
    if (result.ok) {
      applyProjectState(result.state);
    }
  }, [applyProjectState, loadProject]);

  const handleToastClose = useCallback((_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  }, []);

  const onHandleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const srcId = source.droppableId;
    const dstId = destination.droppableId;

    // Dragging a block out of the palette creates a fresh copy in the target list.
    if (srcId === 'MovesList') {
      if (dstId === 'MovesList') {
        return;
      }
      const block = moves[source.index];
      if (!block) {
        return;
      }
      const newItem = { ...block, id: uuidv4() };
      if (dstId === 'MovesActions') {
        const next = [...actions];
        next.splice(destination.index, 0, newItem);
        setActions(next);
      } else if (dstId === 'MovesActions2') {
        const next = [...actions2];
        next.splice(destination.index, 0, newItem);
        setActions2(next);
      }
      return;
    }

    // Reordering within the same action list.
    if (srcId === dstId) {
      if (source.index === destination.index) {
        return;
      }
      if (srcId === 'MovesActions') {
        setActions(reorder(actions, source.index, destination.index));
      } else if (srcId === 'MovesActions2') {
        setActions2(reorder(actions2, source.index, destination.index));
      }
      return;
    }

    // Moving a block between the two action lists.
    const sourceList = srcId === 'MovesActions' ? [...actions] : [...actions2];
    const destList = dstId === 'MovesActions' ? [...actions] : [...actions2];
    const [moved] = sourceList.splice(source.index, 1);
    if (!moved) {
      return;
    }
    destList.splice(destination.index, 0, moved);
    if (srcId === 'MovesActions') {
      setActions(sourceList);
    } else {
      setActions2(sourceList);
    }
    if (dstId === 'MovesActions') {
      setActions(destList);
    } else {
      setActions2(destList);
    }
  };

  return (
    <div className="bg-blue-100 font-sans text-center">
      <NavBar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        savedAtLabel={formatSavedAt(lastSavedAt)}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onImport={handleImport}
      />
      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={handleToastClose}>
        <Alert onClose={handleToastClose} severity={statusType} sx={{ width: '100%' }}>
          {statusMessage}
        </Alert>
      </Snackbar>
      <DragDropContext onDragEnd={onHandleDragEnd}>
        <EventBody
          moves={moves}
          setMoves={setMoves}
          actions={actions}
          actions2={actions2}
          setActions2={setActions2}
          setActions={setActions}
          sprite={sprite}
          setSprite={setSprite}
          sprite2={sprite2}
          setSprite2={setSprite2}
          displayAddIcon={displayAddIcon}
          setDisplayAddIcon={setDisplayAddIcon}
          theme={theme}
          setTheme={setTheme}
          backdropUrl={backdropUrl}
          setBackdropUrl={setBackdropUrl}
          currentVolume={currentVolume}
          setCurrentVolume={setCurrentVolume}
        />
      </DragDropContext>
    </div>
  );
}
