'use client';

import { useState, useEffect } from 'react';

export default function GymSection({ exercises, onExerciseChange }) {
  const [completedExercises, setCompletedExercises] = useState({});

  const toggleExerciseComplete = (exerciseId) => {
    onExerciseChange((prevExercises) => {
      return prevExercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const newCompleted = !exercise.completed;
          return {
            ...exercise,
            completed: newCompleted,
            sets: exercise.sets.map((set) => ({
              ...set,
              completed: newCompleted,
            })),
          };
        }
        return exercise;
      });
    });
  };

  const toggleSetComplete = (exerciseId, setId) => {
    onExerciseChange((prevExercises) => {
      return prevExercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const newSets = exercise.sets.map((set) =>
            set.id === setId ? { ...set, completed: !set.completed } : set
          );
          const allSetsCompleted = newSets.every((set) => set.completed);
          return { ...exercise, completed: allSetsCompleted, sets: newSets };
        }
        return exercise;
      });
    });
  };

  const handleInputChange = (exerciseId, setId, field, value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      onExerciseChange((prevExercises) =>
        prevExercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) =>
                  set.id === setId ? { ...set, [field]: numericValue } : set
                ),
              }
            : exercise
        )
      );
    }
  };

  useEffect(() => {
    const newCompletedExercises = {};
    exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        newCompletedExercises[`${exercise.id}-${set.id}`] = set.completed;
      });
    });
    setCompletedExercises(newCompletedExercises);
  }, [exercises]);

  return (
    <div className="w-full space-y-4">
      {exercises.length === 0 ? (
        <div className="text-center text-gray-500">No exercises available</div>
      ) : (
        exercises.map((exercise) => (
          <div key={exercise.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{exercise.name}</h3>
              <input
                type="checkbox"
                checked={exercise.completed || false}
                onChange={() => toggleExerciseComplete(exercise.id)}
                className="w-5 h-5"
              />
            </div>
            <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Set</th>
                    <th className="p-2 text-left">Reps</th>
                    <th className="p-2 text-left">Weight (kg)</th>
                    <th className="p-2 text-left">Rest (s)</th>
                    <th className="p-2 text-left">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set, index) => (
                    <tr key={set.id} className="border-b border-muted">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            handleInputChange(exercise.id, set.id, 'reps', e.target.value)
                          }
                          className="w-16 p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={set.output}
                          onChange={(e) =>
                            handleInputChange(exercise.id, set.id, 'output', e.target.value)
                          }
                          className="w-16 p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={set.rest}
                          onChange={(e) =>
                            handleInputChange(exercise.id, set.id, 'rest', e.target.value)
                          }
                          className="w-16 p-1 border rounded"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={completedExercises[`${exercise.id}-${set.id}`] || false}
                          onChange={() => toggleSetComplete(exercise.id, set.id)}
                          className="w-4 h-4"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {exercise.videoUrl && (
              <div className="p-4 bg-gray-50">
                <a
                  href={exercise.videoUrl}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Video
                </a>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );  
}
