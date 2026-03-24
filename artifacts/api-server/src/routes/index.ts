import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sourceSystemsRouter from "./source-systems";
import endpointsRouter from "./endpoints";
import parametersRouter from "./parameters";
import runsRouter from "./runs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sourceSystemsRouter);
router.use(endpointsRouter);
router.use(parametersRouter);
router.use(runsRouter);

export default router;
