import { ProjectService } from "../../entities/project/Project.service";
import { TaskService } from "../../entities/task/Task.service";
import { UserService } from "../../entities/user/User.service";

export const EntityServiceRegistry = {
  "/user": UserService,
  "/task": TaskService,
  "/project": ProjectService,
};
