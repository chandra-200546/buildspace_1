import axios from "axios";
import type { AIReview, Challenge, MentorChat, Notification, Post, Project, RightRail } from "../types";
import { localDbApi } from "./localDb";

const useLocalDb = (import.meta.env.VITE_USE_LOCAL_DB ?? "true") === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("buildspace_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getFeed(filter: string, page = 1, limit = 10) {
  if (useLocalDb) return localDbApi.getFeed(filter, page, limit);
  const { data } = await api.get<{ items: Post[] }>(`/api/feed?filter=${filter}&page=${page}&limit=${limit}`);
  return data.items;
}

export async function createPost(payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.createPost(payload);
  const { data } = await api.post<Post>("/api/feed", payload);
  return data;
}

export async function likePost(postId: string) {
  if (useLocalDb) return localDbApi.likePost(postId);
  await api.post(`/api/feed/${postId}/like`);
}

export async function dislikePost(postId: string) {
  if (useLocalDb) return localDbApi.dislikePost(postId);
  await api.post(`/api/feed/${postId}/dislike`);
}

export async function bookmarkPost(postId: string) {
  if (useLocalDb) return localDbApi.bookmarkPost(postId);
  await api.post(`/api/feed/${postId}/bookmark`);
}

export async function repostPost(postId: string) {
  if (useLocalDb) return localDbApi.repostPost(postId);
  await api.post(`/api/feed/${postId}/repost`);
}

export async function addCommentToPost(postId: string, text: string) {
  if (useLocalDb) return localDbApi.addComment(postId, text);
  const { data } = await api.post(`/api/feed/${postId}/comment`, { text });
  return data;
}

export async function registerPostView(postId: string) {
  if (useLocalDb) return localDbApi.registerView(postId);
  await api.post(`/api/feed/${postId}/view`);
}

export async function runPostAiReview(postId: string) {
  if (useLocalDb) return localDbApi.runPostAIReview(postId);
  const { data } = await api.post(`/api/feed/${postId}/ai-review`);
  return data;
}

export async function getRightRail() {
  if (useLocalDb) return localDbApi.getRightRail();
  const { data } = await api.get<RightRail>("/api/meta/right-rail");
  return data;
}

export async function getProjects() {
  if (useLocalDb) return localDbApi.getProjects();
  const { data } = await api.get<Project[]>("/api/projects");
  return data;
}

export async function getProject(slug: string) {
  if (useLocalDb) return localDbApi.getProject(slug);
  const { data } = await api.get<Project & { posts: Post[]; aiReviews: AIReview[] }>(`/api/projects/${slug}`);
  return data;
}

export async function getChallenges() {
  if (useLocalDb) return localDbApi.getChallenges();
  const { data } = await api.get<Challenge[]>("/api/challenges");
  return data;
}

export async function getMentorChats() {
  if (useLocalDb) return localDbApi.getMentorChats();
  const { data } = await api.get<MentorChat[]>("/api/ai/mentor");
  return data;
}

export async function askMentor(prompt: string) {
  if (useLocalDb) return localDbApi.askMentor(prompt);
  const { data } = await api.post<MentorChat>("/api/ai/mentor", { prompt });
  return data;
}

export async function runProjectReview(projectId: string, prompt: string) {
  if (useLocalDb) return localDbApi.runProjectReview(projectId, prompt);
  const { data } = await api.post<AIReview>("/api/ai/project-review", { projectId, prompt });
  return data;
}

export async function getNotifications() {
  if (useLocalDb) return localDbApi.getNotifications();
  const { data } = await api.get<Notification[]>("/api/notifications");
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  if (useLocalDb) return localDbApi.markNotificationAsRead(notificationId);
  const { data } = await api.patch(`/api/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  if (useLocalDb) return localDbApi.markAllNotificationsAsRead();
  const { data } = await api.patch("/api/notifications/read-all");
  return data;
}

export async function getBookmarks(userId: string) {
  if (useLocalDb) return localDbApi.getBookmarks(userId);
  const { data } = await api.get<Post[]>(`/api/meta/bookmarks?userId=${userId}`);
  return data;
}

export async function searchAll(q: string) {
  if (useLocalDb) return localDbApi.searchAll(q);
  const { data } = await api.get(`/api/search?q=${encodeURIComponent(q)}`);
  return data;
}

export async function getProfile(username: string) {
  if (useLocalDb) return localDbApi.getProfile(username);
  const { data } = await api.get(`/api/profiles/${username}`);
  return data;
}

export async function updateProfile(payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.updateProfile(payload);
  const { data } = await api.patch("/api/profiles/me", payload);
  return data;
}

export async function followUser(userId: string) {
  if (useLocalDb) return localDbApi.followUser(userId);
  const { data } = await api.post(`/api/profiles/${userId}/follow`);
  return data;
}

export async function unfollowUser(userId: string) {
  if (useLocalDb) return localDbApi.unfollowUser(userId);
  const { data } = await api.delete(`/api/profiles/${userId}/follow`);
  return data;
}

export async function getRecruiterDashboard() {
  if (useLocalDb) return localDbApi.getRecruiterDashboard();
  const { data } = await api.get("/api/recruiter/dashboard");
  return data;
}

export async function searchTalent(params: { skill?: string; tag?: string; category?: string; openToHire?: boolean }) {
  if (useLocalDb) return localDbApi.searchTalent(params);
  const query = new URLSearchParams();
  if (params.skill) query.append("skill", params.skill);
  if (params.tag) query.append("tag", params.tag);
  if (params.category) query.append("category", params.category);
  if (params.openToHire) query.append("openToHire", "true");

  const { data } = await api.get(`/api/recruiter/search?${query.toString()}`);
  return data;
}

export async function shortlistTalent(userId: string, note?: string) {
  if (useLocalDb) return localDbApi.shortlistTalent(userId, note);
  const { data } = await api.post("/api/recruiter/shortlist", { userId, note });
  return data;
}

export async function getCollabOpportunities() {
  if (useLocalDb) return localDbApi.getCollabOpportunities();
  const { data } = await api.get("/api/collaboration/opportunities");
  return data;
}

export async function sendCollabRequest(payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.sendCollabRequest(payload);
  const { data } = await api.post("/api/collaboration/request", payload);
  return data;
}

export async function getMyCollabRequests() {
  if (useLocalDb) return localDbApi.getMyCollabRequests();
  const { data } = await api.get("/api/collaboration/my-requests");
  return data;
}

export async function login(email: string, password: string) {
  if (useLocalDb) return localDbApi.login(email, password);
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function register(payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.register(payload);
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function submitChallenge(challengeId: string, projectId: string, note: string) {
  if (useLocalDb) return localDbApi.submitChallenge(challengeId, projectId, note);
  const { data } = await api.post(`/api/challenges/${challengeId}/submit`, { projectId, note });
  return data;
}

export async function createProject(payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.createProject(payload);
  const { data } = await api.post("/api/projects", payload);
  return data;
}

export async function createProjectUpdate(projectId: string, payload: Record<string, unknown>) {
  if (useLocalDb) return localDbApi.createProjectUpdate(projectId, payload);
  const { data } = await api.post(`/api/projects/${projectId}/updates`, payload);
  return data;
}

export default api;
