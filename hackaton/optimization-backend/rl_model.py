from ortools.sat.python import cp_model

class Task:
    def __init__(self, task_dict:dict, target: str = "planned"):
        self.id = int(task_dict["poste"])

        if target == "planned":
            time_flag = "tempsPrévu"
        else:
            time_flag = "tempsRéel"
        
        # Convert time string "HH:MM:SS" to seconds
        time_parts = task_dict[time_flag].split(":")
        self.duration = int(time_parts[0]) * 3600 + int(time_parts[1]) * 60 + int(time_parts[2])

        # Get predecessors from the dictionary
        self.predecessors = task_dict["dependencies"]
    
def get_optimal_schedule(tasks_json:list[dict], target: str = "planned") -> list[dict] | None:
    tasks = [Task(task_dict, target) for task_dict in tasks_json]

    model = cp_model.CpModel()
    
    # Variables for start and end times
    tasks_start = [model.NewIntVar(0, int(sum(task.duration for task in tasks)), f'task_start_{task.id}') for task in tasks]
    tasks_end = [model.NewIntVar(0, int(sum(task.duration for task in tasks)), f'task_end_{task.id}') for task in tasks]

    # Each task's end time = start time + duration
    for i, task in enumerate(tasks):
        model.Add(tasks_end[i] == tasks_start[i] + task.duration)

    # Precedence constraints: predecessors must end before the task starts
    for i, task in enumerate(tasks):
        for pred_id in task.predecessors:
            model.Add(tasks_start[i] >= tasks_end[pred_id - 1])

    # Total duration is the maximum of all end times
    total_duration = model.NewIntVar(0, int(sum(task.duration for task in tasks)), 'total_duration')
    model.AddMaxEquality(total_duration, tasks_end)

    model.Minimize(total_duration)

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # Update the original input dicts with the optimal start time (formatted as HH:MM:SS)
        for i, task_dict in enumerate(tasks_json):
            start_seconds = int(solver.Value(tasks_start[i]))
            hours = start_seconds // 3600
            minutes = (start_seconds % 3600) // 60
            seconds = start_seconds % 60
            task_dict["heureDebutOptimale"] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        return tasks_json
    else:
        return None
