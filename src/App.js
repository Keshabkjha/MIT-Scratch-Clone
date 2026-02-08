import React, { useCallback, useEffect, useMemo, useState } from "react";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { EventBody } from './Components/eventBody'
import { NavBar } from './Components/navBar';
import { DragDropContext} from "react-beautiful-dnd";
import { moves as initialMoves } from "./data/moves";
import useProjectPersistence, { CURRENT_PROJECT_VERSION } from './hooks/useProjectPersistence';

export default function App() {
  const [moves, setMoves] = useState(initialMoves);
  const [actions, setActions]= useState([]);
  const [actions2, setActions2]= useState([]);
  const [projectName, setProjectName] = useState('Scratch Project');
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('success');
  const [toastOpen, setToastOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const defaultProjectState = useMemo(() => ({
    version: CURRENT_PROJECT_VERSION,
    data: {
      blocks: initialMoves,
      scripts: { actions: [], actions2: [] },
      sprites: [],
      stage: {},
      variables: {},
      positions: {},
      costumes: [],
      sounds: [],
      settings: {}
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
      sprites: [],
      stage: {},
      variables: {},
      positions: {},
      costumes: [],
      sounds: [],
      settings: {}
    },
    metadata: {
      name: projectName,
      lastSaved: null
    }
  }), [moves, actions, actions2, projectName]);

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
    if (state.metadata?.name) {
      setProjectName(state.metadata.name);
    }
    if (state.metadata?.lastSaved) {
      setLastSavedAt(state.metadata.lastSaved);
    }
  }, [setMoves, setActions, setActions2]);

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
  
  const onHandleDragEnd = (result) =>{
    const {source, destination} = result;
    console.log(source, destination)
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    let add;
    const active = [...moves];
    const complete = [...actions];
    const complete2 = [...actions2]; 

    // take a move to drag and drop 
    add = active[source.index];

    // Destination Logic
    const isFirstActionList = destination.droppableId === "MovesActions";
    const nextActions = isFirstActionList ? [...complete, add] : complete;
    const nextActions2 = isFirstActionList ? complete2 : [...complete2, add];
    setActions(nextActions);
    setActions2(nextActions2);
    setMoves(active);
  }
  
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
          />
        </DragDropContext>
    </div>
  );
}
