'use client';
import { useState, useEffect } from 'react'
import GymSection from '../dashboard/GymSection'
import ExerciseSection from '../dashboard/ExerciseSection'
import Button from "../../components/common/Button"
import ErrorAndLoadingOverlay from '../../components/common/ErrorAndLoadingOverlay'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function PresetEntryComponenet() {
  const [exercisePresetGroups, setExercisePresetGroups] = useState([]);
  const [exercises, setExercises] = useState([]); // State to store all exercises
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [formValues, setFormValues] = useState({
    week: '',
    day: '',
    date: new Date(),
    name: '',
  });
  const [sessionExercises, setSessionExercises] = useState([]);
  const [warmupExercises, setWarmupExercises] = useState([]);
  const [circuitExercises, setCircuitExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:54321/functions/v1';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Fetch exercise preset groups
        const presetGroupsResponse = await fetch(`${API_BASE_URL}/api/exercise_preset_groups`);
        if (!presetGroupsResponse.ok) throw new Error('Failed to fetch preset groups.');
        const presetGroupsData = await presetGroupsResponse.json();
        setExercisePresetGroups(presetGroupsData.exercise_preset_groups);

        // Fetch all exercises
        const exercisesResponse = await fetch(`${API_BASE_URL}/api/exercises`);
        if (!exercisesResponse.ok) throw new Error('Failed to fetch exercises.');
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData.exercises);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedGroup || sessionExercises.length === 0) return;

    const gym = sessionExercises
      .filter((preset) => exercises.some((exercise) => exercise.id === preset.exercise_id && exercise.exercise_type_id === 1))
      .map((preset) => {
        const exercise = exercises.find((exercise) => exercise.id === preset.exercise_id);
        return {
          id: exercise.id,
          name: exercise.name,
          sets: sessionExercises
            .filter((sessionExercise) => sessionExercise.exercise_id === exercise.id)
            .map((sessionExercise) => ({
              id: sessionExercise.id,
              reps: sessionExercise.reps,
              rest: sessionExercise.set_rest_time,
              output: sessionExercise.output,
            })),
          videoUrl: exercise.video_url,
        };
      });

    const warmup = sessionExercises
      .filter((preset) => exercises.some((exercise) => exercise.id === preset.exercise_id && exercise.exercise_type_id === 4))
      .map((preset) => {
        const exercise = exercises.find((exercise) => exercise.id === preset.exercise_id);
        return {
          id: exercise.id,
          name: exercise.name,
          sets: 1,
          reps: preset.reps,
          videoUrl: exercise.video_url,
        };
      });

    const circuit = sessionExercises
      .filter((preset) => exercises.some((exercise) => exercise.id === preset.exercise_id && exercise.exercise_type_id === 5))
      .map((preset) => {
        const exercise = exercises.find((exercise) => exercise.id === preset.exercise_id);
        return {
          id: exercise.id,
          name: exercise.name,
          sets: 1,
          reps: preset.reps,
          videoUrl: exercise.video_url,
        };
      });

    setWarmupExercises(warmup);
    setCircuitExercises(circuit);
    setSessionExercises(gym);
  }, [selectedGroup, sessionExercises, exercises]);

  const handleGroupSelection = (groupId) => {
    if (groupId === 'new') {
      setIsNewGroup(true);
      setFormValues({ week: '', day: '', date: new Date(), name: '' });
      setSessionExercises([]);
      setWarmupExercises([]);
      setCircuitExercises([]);
      setSelectedGroup(null);
    } else {
      const group = exercisePresetGroups.find((g) => g.id === parseInt(groupId));
      setSelectedGroup(group);
      setIsNewGroup(false);
      setFormValues({
        week: group.week,
        day: group.day,
        date: new Date(group.date),
        name: group.name,
      });
      fetchExercisesForGroup(groupId);
    }
  };

  const fetchExercisesForGroup = async (groupId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/exercise_presets?exercise_preset_group_id=${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch exercises.');
      const data = await response.json();
      console.log('Fetched exercises for group:', data);
      setSessionExercises(data.exercise_presets);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const savePresetGroup = async () => {
    try {
      setIsLoading(true);
      const url = isNewGroup
        ? `${API_BASE_URL}/api/exercise_preset_groups`
        : `${API_BASE_URL}/api/exercise_preset_groups/${selectedGroup.id}`;
      const method = isNewGroup ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formValues,
          date: formValues.date.toISOString().split('T')[0],
        }),
      });
      if (!response.ok) throw new Error('Failed to save preset group.');
      alert('Preset group saved successfully!');
      setIsNewGroup(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <ErrorAndLoadingOverlay isLoading={isLoading} error={error} />

      {/* Section 1: Preset Group Selection */}
      <div className="space-y-4">
        <label htmlFor="presetGroup" className="block text-lg font-semibold">
          Select or Create a Preset Group
        </label>
        <select
          id="presetGroup"
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => handleGroupSelection(e.target.value)}
        >
          <option value="">Select a group</option>
          {exercisePresetGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} (Date: {group.date})
            </option>
          ))}
          <option value="new">Create New</option>
        </select>

        {isNewGroup || selectedGroup ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="number"
              placeholder="Week"
              value={formValues.week}
              onChange={(e) => handleInputChange('week', e.target.value)}
              className="p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Day"
              value={formValues.day}
              onChange={(e) => handleInputChange('day', e.target.value)}
              className="p-2 border rounded-md"
            />
            <DatePicker
              selected={formValues.date}
              onChange={(date) => handleInputChange('date', date)}
              className="p-2 border rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Name"
              value={formValues.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>
        ) : null}
      </div>

      {/* Section 2: Exercise Management */}
      {selectedGroup || isNewGroup ? (
        <div className="space-y-4">
          <ExerciseSection exercises={warmupExercises} onExerciseChange={setWarmupExercises} />
          <ExerciseSection exercises={circuitExercises} onExerciseChange={setCircuitExercises} />
        </div>
      ) : null}

      {/* Save Button */}
      <div className="mt-4">
        <Button onClick={savePresetGroup}>Save Preset Group</Button>
      </div>
    </div>
  );
}
