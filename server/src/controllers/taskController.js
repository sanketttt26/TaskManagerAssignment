import { Task } from "../models/Task.js";

export async function createTask(req, res, next) {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "title required" });
    const task = await Task.create({ title, description: description || "", owner: req.user._id });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.title === "string") updates.title = req.body.title;
    if (typeof req.body.description === "string") updates.description = req.body.description;
    if (typeof req.body.completed === "boolean") updates.completed = req.body.completed;
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, updates, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Admin-only: list all tasks
export async function adminListAllTasks(req, res, next) {
  try {
    const tasks = await Task.find({}).populate("owner", "name email role").sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
}

