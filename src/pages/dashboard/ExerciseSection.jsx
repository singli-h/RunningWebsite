'use client'

import { useState } from 'react';

export default function ExerciseSection({ exercises, onExerciseChange }) {
  const [completedExercises, setCompletedExercises] = useState({});

  const toggleExerciseComplete = (exerciseId) => {
    const newCompletedExercises = { ...completedExercises, [exerciseId]: !completedExercises[exerciseId] };
    setCompletedExercises(newCompletedExercises);
    onExerciseChange(exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, completed: newCompletedExercises[exerciseId] } : exercise
    ));
  };

  const handleInputChange = (exerciseId, field, value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) { 
      onExerciseChange(exercises.map(exercise => 
        exercise.id === exerciseId ? { ...exercise, [field]: numericValue } : exercise
      ));
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {exercises.length === 0 ? (
        <div className="text-center text-gray-500">No exercises available</div>
      ) : (
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Exercise</th>
            <th className="p-2 text-left">Sets</th>
            <th className="p-2 text-left">Reps</th>
            <th className="p-2 text-left">Video</th>
            <th className="p-2 text-left">Done</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id} className="border-b border-muted">
              <td className="p-2">{exercise.name}</td>
              <td className="p-2">
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => handleInputChange(exercise.id, 'sets', e.target.value)}
                  className="w-16 p-1 border rounded"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => handleInputChange(exercise.id, 'reps', e.target.value)}
                  className="w-16 p-1 border rounded"
                />
              </td>
              <td className="p-2">
                {exercise.videoUrl && (
                  <a href={exercise.videoUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    Watch
                  </a>
                )}
              </td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={completedExercises[exercise.id] || false}
                  onChange={() => toggleExerciseComplete(exercise.id)}
                  className="w-4 h-4"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

