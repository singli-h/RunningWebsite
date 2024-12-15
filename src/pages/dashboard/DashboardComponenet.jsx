'use client'

import { useState, useEffect } from "react"
import GymSection from "./GymSection"
import ExerciseSection from "./ExerciseSection"
import ErrorAndLoadingOverlay from "../../components/common/ErrorAndLoadingOverlay"
import Button from "../../components/common/Button"

export default function DashboardComponent() {
  const [useTrainingExercises, setUseTrainingExercises] = useState(false)
  const [exercises, setExercises] = useState([])
  const [exercisePresets, setExercisePresets] = useState([])
  const [exercisePresetGroups, setExercisePresetGroups] = useState([])
  const [trainingSessions, setTrainingSessions] = useState([])
  const [trainingExercises, setTrainingExercises] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [gymExercises, setGymExercises] = useState([])
  const [warmupExercises, setWarmupExercises] = useState([])
  const [circuitExercises, setCircuitExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:54321/functions/v1/api"

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/exercisesInit`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        setExercises(data.exercises);
        setExercisePresetGroups(data.exercisePresetGroups);
        setTrainingSessions(data.trainingSessions);
        setExercisePresets(data.currentWeekPresets);
        
        let initialSessionExercises;
        let initialSelectedGroup = null;
        if(data.todaysSessionOrPreset != null){
          if (data.todaysSessionOrPreset.type === 'session') {
            initialSessionExercises = data.todaysSessionOrPreset.data.exercises;
            initialSelectedGroup = {
              id: data.todaysSessionOrPreset.data.exercise_preset_group_id,
              name: data.exercisePresetGroups.find(
                (group) => group.id === data.todaysSessionOrPreset.data.exercise_preset_group_id
              )?.name,
              date: new Date(),
            };
          } else if (data.todaysSessionOrPreset.type === 'preset') {
            initialSessionExercises = data.todaysSessionOrPreset.data;
            console.log(data.todaysSessionOrPreset);
            initialSelectedGroup = {
              id: data.todaysSessionOrPreset.data.id,
              name: data.exercisePresetGroups.find(
                (group) => group.id === data.todaysSessionOrPreset.data.id
              )?.name,
              date: new Date(),
            };
          }
          
          setTrainingExercises(initialSessionExercises);
          setSelectedGroup(initialSelectedGroup);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSessionOrPresetExercises = async () => {
      if (!selectedGroup || !selectedWeek || !selectedDay) return;

      setIsLoading(true);
      setError(null);

      try {
        const selectedSession = trainingSessions.find((session) => {
          return (
            session.exercise_preset_group_id === selectedGroup.id
          );
        });

        if (selectedSession) {
          const exerciseRes = await fetch(
            `${API_BASE_URL}/training_exercises?training_session_id=${selectedSession.id}`);
          if (!exerciseRes.ok) {
            throw new Error('Network response was not ok');
          }
          const exerciseData = await exerciseRes.json();
          setTrainingExercises(exerciseData.training_exercises);
          setUseTrainingExercises(true);
        } else {
          const presetsRes = await fetch(
            `${API_BASE_URL}/exercise_presets?exercise_preset_group_id=${selectedGroup.id}`);
          if (!presetsRes.ok) {
            throw new Error('Network response was not ok');
          }
          const presetsData = await presetsRes.json();
          setExercisePresets(presetsData.exercise_presets);
          setUseTrainingExercises(false);
        }
      } catch (err) {
        console.error('Error fetching session or preset exercises:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionOrPresetExercises();
  }, [selectedGroup, selectedWeek, selectedDay]);

  useEffect(() => {
    const sessionExercises = useTrainingExercises ? trainingExercises : exercisePresets;

    if (exercises.length === 0 || sessionExercises.length === 0) return; 

    const gym = exercises
      .filter((exercise) => exercise.exercise_type_id === 2)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: sessionExercises
          .filter((sessionExercise) => sessionExercise.exercise_id === exercise.id)
          .map((sessionExercise) => ({
            id: sessionExercise.id,
            reps: sessionExercise.reps,
            rest: sessionExercise.set_rest_time,
            output: sessionExercise.output,
            completed: sessionExercise.completed || false
          })),
        videoUrl: exercise.videoUrl,
      }));

    const warmup = exercises
      .filter((exercise) => exercise.exercise_type_id === 1)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: 1,
        reps: exercise.defaultReps,
        videoUrl: exercise.videoUrl,
        completed: exercise.completed || false
      }));

    const circuit = exercises
      .filter((exercise) => exercise.exercise_type_id === 3)
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: 1,
        reps: exercise.defaultReps,
        videoUrl: exercise.videoUrl,
        completed: exercise.completed || false
      }));

    setGymExercises(gym);
    setWarmupExercises(warmup);
    setCircuitExercises(circuit);
  }, [exercises, exercisePresets, trainingExercises, useTrainingExercises]);

  const [openSections, setOpenSections] = useState({
    "Warm Up": true,
    Gym: true,
    Circuit: true,
  })

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const getUniqueWeeks = () => {
    return [...new Set(exercisePresetGroups.map((group) => group.week))].sort(
      (a, b) => a - b
    )
  }

  const getAvailableDays = () => {
    if (!selectedWeek) return []
    return [
      ...new Set(
        exercisePresetGroups
          .filter((group) => group.week === parseInt(selectedWeek))
          .map((group) => group.day)
      ),
    ].sort((a, b) => a - b)
  }

  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value)
    setSelectedDay(null)
    setSelectedGroup(null)
  }

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value)
    const group = exercisePresetGroups.find(
      (group) =>
        group.week === parseInt(selectedWeek) &&
        group.day === parseInt(e.target.value)
    )
    setSelectedGroup(group || null)
  }

  const saveTrainingExercise = async () => {
    try {
      const allExercises = [
        ...gymExercises,
        ...warmupExercises,
        ...circuitExercises,
      ]

      const exercisesToSave = allExercises.flatMap((exercise) => 
        exercise.sets.map((set) => ({
          id: set.id,
          training_session_id: selectedGroup.id,
          exercise_id: exercise.id,
          reps: set.reps,
          output: set.output,
          set_rest_time: set.rest,
          completed: set.completed,
        }))
      );

      const method = useTrainingExercises ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/training_exercises${useTrainingExercises ? `/${selectedGroup.id}` : ''}`;

      console.log(url);
      console.log(exercisesToSave);
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exercisesToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save exercises');
      }

      alert("Exercises saved successfully!")
    } catch (error) {
      console.error("Error saving exercises:", error)
      alert("Failed to save exercises. Please try again.")
    }
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-4 relative">
      <ErrorAndLoadingOverlay isLoading={isLoading} error={error} />
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between"> {/* Add justify-between */}
          <h1 className="text-2xl font-bold mb-6">
            {(selectedGroup ? selectedGroup.date + " " + (useTrainingExercises ? "Completed" : "Todo") : "") }
          </h1>
          <Button onClick={saveTrainingExercise}>Save</Button>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Program</h2>
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-zinc-900">
              {selectedGroup ? selectedGroup.name : "No group selected"}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Week</h2>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-zinc-900"
              value={selectedWeek || ""}
              onChange={handleWeekChange}
            >
              <option value="">Select a week</option>
              {getUniqueWeeks().map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-col">Day</h2>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-zinc-900"
              value={selectedDay || ""}
              onChange={handleDayChange}
              disabled={!selectedWeek}
            >
              <option value="">Select a day</option>
              {getAvailableDays().map((day) => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {false && selectedGroup && (
          <p className="mt-2">
            Selected: {selectedGroup.id} - {selectedGroup.name} - Week{" "}
            {selectedWeek}, Day {selectedDay} - SessionID {selectedGroup.id}
          </p>
        )}

        {["Warm Up", "Gym", "Circuit"].map((section) => (
          <div
            key={section}
            className="border text-gray-700 border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="flex items-center justify-between w-full p-4 bg-gray-100 text-left"
              onClick={() => toggleSection(section)}
            >
              <h2 className="text-xl font-semibold">{section}</h2>
              <span className="text-2xl">
                {openSections[section] ? "▲" : "▼"}
              </span>
            </button>
            {openSections[section] && (
              <div className="bg-white p-4">
                {section === "Gym" ? (
                  <GymSection
                    exercises={gymExercises}
                    onExerciseChange={setGymExercises}
                  />
                ) : (
                  <ExerciseSection
                    exercises={
                      section === "Warm Up" ? warmupExercises : circuitExercises
                    }
                    onExerciseChange={
                      section === "Warm Up"
                        ? setWarmupExercises
                        : setCircuitExercises
                    }
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

