"use client"

import { useState, useEffect } from "react"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"
import Textarea from "../../components/common/Textarea"
import Checkbox from "../../components/common/Checkbox"
import Label from "../../components/common/Label"
import { Card, CardContent } from "../../components/common/Card"
import { Search, Plus, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/common/Tabs"

const exerciseLibrary = [
  { id: "squat", name: "Squat", type: "gym" },
  { id: "deadlift", name: "Deadlift", type: "gym" },
  { id: "bench-press", name: "Bench Press", type: "gym" },
  { id: "overhead-press", name: "Overhead Press", type: "gym" },
  { id: "row", name: "Row", type: "gym" },
  { id: "pull-up", name: "Pull-up", type: "gym" },
  { id: "lunge", name: "Lunge", type: "gym" },
  { id: "plank", name: "Plank", type: "gym" },
  { id: "jumping-jacks", name: "Jumping Jacks", type: "warmup" },
  { id: "arm-circles", name: "Arm Circles", type: "warmup" },
  { id: "leg-swings", name: "Leg Swings", type: "warmup" },
  { id: "burpees", name: "Burpees", type: "circuit" },
  { id: "mountain-climbers", name: "Mountain Climbers", type: "circuit" },
  { id: "jump-rope", name: "Jump Rope", type: "circuit" },
]

const progressionModels = ["Increasing Reps", "Increasing Sets", "Increasing Load"]

const MesocycleWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    goals: "",
    startDate: "",
    duration: "",
    sessionsPerWeek: "",
    exercises: [],
    sessions: [],
    specialConstraints: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredExercises, setFilteredExercises] = useState(exerciseLibrary)
  const [activeSession, setActiveSession] = useState(1)
  const [activePart, setActivePart] = useState("warmup")

  useEffect(() => {
    setFilteredExercises(
      exerciseLibrary.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (activePart === "gym" ? exercise.type === "gym" : exercise.type === activePart),
      ),
    )
  }, [searchTerm, activePart])

  useEffect(() => {
    if (formData.sessionsPerWeek) {
      setFormData((prevData) => ({
        ...prevData,
        sessions: Array.from({ length: Number(formData.sessionsPerWeek) }, (_, i) => ({
          id: i + 1,
          goal: "",
          progressionModel: [],
        })),
      }))
    }
  }, [formData.sessionsPerWeek])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSessionInputChange = (sessionId, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      sessions: prevData.sessions.map((session) =>
        session.id === sessionId ? { ...session, [field]: value } : session,
      ),
    }))
  }

  const handleAddExercise = (exercise) => {
    if (
      !formData.exercises.some((ex) => ex.id === exercise.id && ex.session === activeSession && ex.part === activePart)
    ) {
      setFormData((prevData) => ({
        ...prevData,
        exercises: [
          ...prevData.exercises,
          { ...exercise, reps: "", sets: "", oneRepMax: "", session: activeSession, part: activePart },
        ],
      }))
    }
  }

  const handleRemoveExercise = (id, session, part) => {
    setFormData((prevData) => ({
      ...prevData,
      exercises: prevData.exercises.filter((ex) => !(ex.id === id && ex.session === session && ex.part === part)),
    }))
  }

  const handleExerciseDetailChange = (id, session, part, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      exercises: prevData.exercises.map((ex) =>
        ex.id === id && ex.session === session && ex.part === part ? { ...ex, [field]: value } : ex,
      ),
    }))
  }

  const handleProgressionModelChange = (sessionId, model) => {
    setFormData((prevData) => {
      const updatedSessions = prevData.sessions.map((session) => {
        if (session.id === sessionId) {
          const existingIndex = session.progressionModel.findIndex((m) => m.model === model)
          if (existingIndex !== -1) {
            return {
              ...session,
              progressionModel: session.progressionModel.filter((_, index) => index !== existingIndex),
            }
          } else {
            return {
              ...session,
              progressionModel: [...session.progressionModel, { model, value: "" }],
            }
          }
        }
        return session
      })
      return { ...prevData, sessions: updatedSessions }
    })
  }

  const handleProgressionValueChange = (sessionId, model, value) => {
    setFormData((prevData) => {
      const updatedSessions = prevData.sessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            progressionModel: session.progressionModel.map((m) => (m.model === model ? { ...m, value } : m)),
          }
        }
        return session
      })
      return { ...prevData, sessions: updatedSessions }
    })
  }

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/mesocycle/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to generate mesocycle")
      const data = await response.json()
      onComplete(data)
    } catch (error) {
      console.error("Error generating mesocycle:", error)
      // Handle error (e.g., show error message to user)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Step 1: Mesocycle Overview</h2>
              <div>
                <Label htmlFor="goals" className="block text-lg font-medium text-gray-700">Goal Definition</Label>
                <Textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  placeholder="Describe overall goals (e.g., increase 1RM, improve power/velocity)"
                  className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-4"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate" className="block text-lg font-medium text-gray-700">Start Date</Label>
                  <Input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="block text-lg font-medium text-gray-700">Duration (weeks)</Label>
                  <Input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sessionsPerWeek" className="block text-lg font-medium text-gray-700">Sessions per Week</Label>
                  <Input
                    type="number"
                    id="sessionsPerWeek"
                    name="sessionsPerWeek"
                    value={formData.sessionsPerWeek}
                    onChange={handleInputChange}
                    min="1"
                    max="7"
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
              </div>
              <Button type="button" onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Step 2: Exercise & Progression Inputs</h2>
              <Tabs
                value={`session-${activeSession}`}
                onValueChange={(value) => setActiveSession(Number(value.split("-")[1]))}
              >
                <TabsList className="mb-6">
                  {formData.sessions.map((session) => (
                    <TabsTrigger key={`session-${session.id}`} value={`session-${session.id}`} className="text-blue-600 hover:text-blue-800">
                      Session {session.id}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {formData.sessions.map((session) => (
                  <TabsContent key={`session-${session.id}`} value={`session-${session.id}`} className="p-4 bg-gray-50 rounded-md">
                    <div className="space-y-4 mb-4">
                      <div>
                        <Label htmlFor={`session-${session.id}-goal`} className="block text-lg font-medium text-gray-700">Session Goal</Label>
                        <Input
                          id={`session-${session.id}-goal`}
                          value={session.goal}
                          onChange={(e) => handleSessionInputChange(session.id, "goal", e.target.value)}
                          placeholder="Enter session goal"
                          className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="block text-lg font-medium text-gray-700">Progression Model</Label>
                        <div className="space-y-2 mt-2">
                          {progressionModels.map((model) => (
                            <div key={model} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${session.id}-${model}`}
                                checked={session.progressionModel.some((m) => m.model === model)}
                                onCheckedChange={() => handleProgressionModelChange(session.id, model)}
                              />
                              <Label htmlFor={`${session.id}-${model}`} className="text-sm font-medium text-gray-700">
                                {model}
                              </Label>
                              {session.progressionModel.some((m) => m.model === model) && (
                                <Input
                                  type="text"
                                  placeholder="e.g., increase by 2-3 reps"
                                  value={session.progressionModel.find((m) => m.model === model)?.value || ""}
                                  onChange={(e) => handleProgressionValueChange(session.id, model, e.target.value)}
                                  className="ml-2 flex-grow mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Tabs value={activePart} onValueChange={setActivePart}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="warmup">Warm-up</TabsTrigger>
                        <TabsTrigger value="gym">Gym Exercises</TabsTrigger>
                        <TabsTrigger value="circuit">Circuits</TabsTrigger>
                      </TabsList>
                      <TabsContent value="warmup">
                        <ExerciseSection
                          exercises={formData.exercises.filter(
                            (ex) => ex.session === session.id && ex.part === "warmup",
                          )}
                          filteredExercises={filteredExercises}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          handleAddExercise={handleAddExercise}
                          handleRemoveExercise={handleRemoveExercise}
                          handleExerciseDetailChange={handleExerciseDetailChange}
                          showOneRepMax={false}
                        />
                      </TabsContent>
                      <TabsContent value="gym">
                        <ExerciseSection
                          exercises={formData.exercises.filter((ex) => ex.session === session.id && ex.part === "gym")}
                          filteredExercises={filteredExercises}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          handleAddExercise={handleAddExercise}
                          handleRemoveExercise={handleRemoveExercise}
                          handleExerciseDetailChange={handleExerciseDetailChange}
                          showOneRepMax={true}
                        />
                      </TabsContent>
                      <TabsContent value="circuit">
                        <ExerciseSection
                          exercises={formData.exercises.filter(
                            (ex) => ex.session === session.id && ex.part === "circuit",
                          )}
                          filteredExercises={filteredExercises}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          handleAddExercise={handleAddExercise}
                          handleRemoveExercise={handleRemoveExercise}
                          handleExerciseDetailChange={handleExerciseDetailChange}
                          showOneRepMax={false}
                        />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                ))}
              </Tabs>
              <div>
                <Label htmlFor="specialConstraints" className="block text-lg font-medium text-gray-700">Special Constraints (Optional)</Label>
                <Textarea
                  id="specialConstraints"
                  name="specialConstraints"
                  value={formData.specialConstraints}
                  onChange={handleInputChange}
                  placeholder="Enter any specific conditions (e.g., injury limitations, equipment restrictions)"
                  className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={handleBack}>
                  Back
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Step 3: Confirmation & AI Request</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Summary:</h3>
                <p>
                  <strong>Goals:</strong> {formData.goals}
                </p>
                <p>
                  <strong>Start Date:</strong> {formData.startDate}
                </p>
                <p>
                  <strong>Duration:</strong> {formData.duration} weeks
                </p>
                <p>
                  <strong>Sessions per Week:</strong> {formData.sessionsPerWeek}
                </p>
                <p>
                  <strong>Sessions:</strong>
                </p>
                {formData.sessions.map((session) => (
                  <div key={`session-summary-${session.id}`} className="ml-4 mb-2">
                    <p>
                      <strong>Session {session.id}:</strong>
                    </p>
                    <p>
                      <em>Goal:</em> {session.goal}
                    </p>
                    <p>
                      <em>Progression Model:</em>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      {session.progressionModel.map(({ model, value }) => (
                        <li key={model}>
                          {model}: {value}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <em>Exercises:</em>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      {formData.exercises
                        .filter((ex) => ex.session === session.id)
                        .map((ex) => (
                          <li key={`${ex.id}-${ex.session}-${ex.part}`}>
                            {ex.name} - Reps: {ex.reps}, Sets: {ex.sets}
                            {ex.part === "gym" && `, 1RM: ${ex.oneRepMax}%`}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
                <p>
                  <strong>Special Constraints:</strong> {formData.specialConstraints || "None"}
                </p>
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit">Generate Mesocycle</Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

const ExerciseSection = ({
  exercises,
  filteredExercises,
  searchTerm,
  setSearchTerm,
  handleAddExercise,
  handleRemoveExercise,
  handleExerciseDetailChange,
  showOneRepMax,
}) => (
  <div className="space-y-4">
    <Label className="block text-lg font-medium text-gray-700">Exercise Library</Label>
    <div className="flex items-center space-x-2">
      <Search className="w-5 h-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      {filteredExercises.map((exercise) => (
        <Button
          key={exercise.id}
          type="button"
          variant="outline"
          className="justify-between"
          onClick={() => handleAddExercise(exercise)}
          disabled={exercises.some((ex) => ex.id === exercise.id)}
        >
          {exercise.name}
          <Plus className="w-4 h-4" />
        </Button>
      ))}
    </div>
    <div>
      <Label className="block text-lg font-medium text-gray-700">Selected Exercises</Label>
      <div className="overflow-x-auto mt-2">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 text-left w-1/4">Exercise</th>
              <th className="p-2 text-left w-1/6">Reps</th>
              <th className="p-2 text-left w-1/6">Sets</th>
              {showOneRepMax && <th className="p-2 text-left w-1/6">1RM (%)</th>}
              <th className="p-2 text-left w-1/6">Action</th>
            </tr>
          </thead>
          <tbody>
            {exercises.length === 0 ? (
              <tr>
                <td colSpan={showOneRepMax ? 5 : 4} className="p-2 text-center text-gray-500">
                  No exercises selected
                </td>
              </tr>
            ) : (
              exercises.map((exercise) => (
                <tr key={`${exercise.id}-${exercise.session}-${exercise.part}`} className="border-b">
                  <td className="p-2">{exercise.name}</td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) =>
                        handleExerciseDetailChange(exercise.id, exercise.session, exercise.part, "reps", e.target.value)
                      }
                      className="w-full"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={exercise.sets}
                      onChange={(e) =>
                        handleExerciseDetailChange(exercise.id, exercise.session, exercise.part, "sets", e.target.value)
                      }
                      className="w-full"
                    />
                  </td>
                  {showOneRepMax && (
                    <td className="p-2">
                      <Input
                        type="text"
                        value={exercise.oneRepMax}
                        onChange={(e) =>
                          handleExerciseDetailChange(
                            exercise.id,
                            exercise.session,
                            exercise.part,
                            "oneRepMax",
                            e.target.value,
                          )
                        }
                        className="w-full"
                      />
                    </td>
                  )}
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveExercise(exercise.id, exercise.session, exercise.part)}
                      className="p-1"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

export default MesocycleWizard

