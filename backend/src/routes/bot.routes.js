import { registerBotHandlers, setupMenuButton } from '../controllers/botController.js';

/** Bot buyruqlari va menyu tugmasini ulaydi. */
export async function registerBotRoutes() {
  registerBotHandlers();
  await setupMenuButton();
}

export default registerBotRoutes;
