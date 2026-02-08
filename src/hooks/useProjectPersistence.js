import { useCallback, useEffect, useRef } from 'react';

export const CURRENT_PROJECT_VERSION = 2;
export const DEFAULT_STORAGE_KEY = 'scratch-project-v1';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
const ensureObject = (value, fallback = {}) => (isPlainObject(value) ? value : fallback);

const safeClone = (value) => JSON.parse(JSON.stringify(value));

export const normalizeProjectState = (incomingState, fallbackState) => {
  const fallback = fallbackState
    ? safeClone(fallbackState)
    : {
        version: CURRENT_PROJECT_VERSION,
        data: {
          blocks: [],
          scripts: { actions: [], actions2: [] },
          sprites: [],
          stage: {},
          variables: {},
          positions: {},
          costumes: [],
          sounds: [],
          settings: {}
        },
        metadata: { name: 'Untitled', lastSaved: null }
      };

  const normalized = {
    ...fallback,
    ...ensureObject(incomingState, {})
  };

  normalized.version = CURRENT_PROJECT_VERSION;
  normalized.data = {
    ...fallback.data,
    ...ensureObject(incomingState?.data, {})
  };

  normalized.data.blocks = ensureArray(incomingState?.data?.blocks, fallback.data.blocks);
  normalized.data.scripts = {
    ...fallback.data.scripts,
    ...ensureObject(incomingState?.data?.scripts, {})
  };
  normalized.data.scripts.actions = ensureArray(
    incomingState?.data?.scripts?.actions,
    fallback.data.scripts.actions
  );
  normalized.data.scripts.actions2 = ensureArray(
    incomingState?.data?.scripts?.actions2,
    fallback.data.scripts.actions2
  );
  normalized.data.sprites = ensureArray(incomingState?.data?.sprites, fallback.data.sprites);
  normalized.data.stage = ensureObject(incomingState?.data?.stage, fallback.data.stage);
  normalized.data.variables = ensureObject(incomingState?.data?.variables, fallback.data.variables);
  normalized.data.positions = ensureObject(incomingState?.data?.positions, fallback.data.positions);
  normalized.data.costumes = ensureArray(incomingState?.data?.costumes, fallback.data.costumes);
  normalized.data.sounds = ensureArray(incomingState?.data?.sounds, fallback.data.sounds);
  normalized.data.settings = ensureObject(incomingState?.data?.settings, fallback.data.settings);

  normalized.metadata = {
    ...fallback.metadata,
    ...ensureObject(incomingState?.metadata, {})
  };

  if (!normalized.metadata.name) {
    normalized.metadata.name = fallback.metadata.name || 'Untitled';
  }

  return normalized;
};

export const validateProjectState = (state) => {
  if (!isPlainObject(state)) {
    return { ok: false, error: 'Project file is not a valid JSON object.' };
  }
  if (typeof state.version !== 'number') {
    return { ok: false, error: 'Project file is missing a version number.' };
  }
  if (state.version > CURRENT_PROJECT_VERSION) {
    return { ok: false, error: 'Project file was created with a newer version.' };
  }
  if (!isPlainObject(state.data)) {
    return { ok: false, error: 'Project data is missing or corrupted.' };
  }
  return { ok: true };
};

export const migrateProjectState = (state) => {
  let workingState = safeClone(state);

  if (workingState.version === 1) {
    workingState = {
      ...workingState,
      version: 2
    };
  }

  return workingState;
};

const useProjectPersistence = ({
  projectState,
  fallbackState,
  storageKey = DEFAULT_STORAGE_KEY,
  autoSaveDelay = 800,
  autoSaveEnabled = true,
  onSave
}) => {
  const hasInitialized = useRef(false);

  const saveProject = useCallback(
    (overrideState) => {
      try {
        const preparedState = normalizeProjectState(overrideState || projectState, fallbackState);
        preparedState.metadata = {
          ...preparedState.metadata,
          lastSaved: new Date().toISOString()
        };

        localStorage.setItem(storageKey, JSON.stringify(preparedState));
        if (onSave) {
          onSave(preparedState);
        }
        return { ok: true, state: preparedState };
      } catch (error) {
        return { ok: false, error };
      }
    },
    [projectState, fallbackState, storageKey, onSave]
  );

  const loadProject = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return { ok: false, error: new Error('No saved project found.') };
      }
      const parsed = JSON.parse(raw);
      const validation = validateProjectState(parsed);
      if (!validation.ok) {
        return { ok: false, error: new Error(validation.error) };
      }
      const migrated = migrateProjectState(parsed);
      const normalized = normalizeProjectState(migrated, fallbackState);
      return { ok: true, state: normalized };
    } catch (error) {
      return { ok: false, error };
    }
  }, [fallbackState, storageKey]);

  const exportProject = useCallback(
    (overrideState) => {
      const saveResult = saveProject(overrideState || projectState);
      if (!saveResult.ok) {
        return saveResult;
      }

      try {
        const fileNameBase = saveResult.state.metadata?.name || 'scratch-project';
        const blob = new Blob([JSON.stringify(saveResult.state, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileNameBase}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return { ok: true, state: saveResult.state };
      } catch (error) {
        return { ok: false, error };
      }
    },
    [projectState, saveProject]
  );

  const importProject = useCallback(
    async (file) => {
      if (!file) {
        return { ok: false, error: new Error('No file selected.') };
      }
      if (!file.name.toLowerCase().endsWith('.json')) {
        return { ok: false, error: new Error('Invalid file type. Please select a JSON file.') };
      }

      try {
        const content = await file.text();
        const parsed = JSON.parse(content);
        const validation = validateProjectState(parsed);
        if (!validation.ok) {
          return { ok: false, error: new Error(validation.error) };
        }
        const migrated = migrateProjectState(parsed);
        const normalized = normalizeProjectState(migrated, fallbackState);
        return { ok: true, state: normalized };
      } catch (error) {
        return { ok: false, error };
      }
    },
    [fallbackState]
  );

  useEffect(() => {
    if (!autoSaveEnabled) {
      return undefined;
    }
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      saveProject();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [projectState, autoSaveDelay, autoSaveEnabled, saveProject]);

  return {
    saveProject,
    loadProject,
    exportProject,
    importProject
  };
};

export default useProjectPersistence;
