// Declare the module for comments-submit.js
declare module '../services/comments-submit' {
    export const submitComment: (text: string, username: string) => Promise<any>;
}
