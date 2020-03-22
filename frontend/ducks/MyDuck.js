const namespace = 'global.my';

const SPE_COURSES = `${namespace}.SPE_COURSES`;
const SPE_CATEGORIES = `${namespace}.SPE_CATEGORIES`;

const initialState = {
  speCourses: {},
  courses: [],
  speCategories: {},
  speCourseForActions: {}
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_SPE_GET_COURSE': {
      return { ...state, speCourseForActions: action.payload };
    }
    case SPE_COURSES: {
      if (state.speCourses.status === 'success') {
        if (action.spe.status === 'success') {
          return { ...state, courses: action.spe.payload };
        } else {
          return state;
        }
      } else {
        if (action.spe.status === 'success') {
          return { ...state, speCourses: { ...action.spe, payload: null }, courses: action.spe.payload };
        } else {
          return { ...state, speCourses: { ...action.spe, payload: null } };
        }
      }
    }
    case `${namespace}.REVIEW_PROBLEM`: {
      const newState = JSON.parse(JSON.stringify(state));
      const courseId = action.payload.courseId;
      const problemId = action.payload.problemId;

      newState.courses.find((course) =>
        course.problems.find((problem) => {
          if (problem.id === problemId) {
            // todo set actual nextDueDate?
            problem.nextDueDate = "2044-02-05T21:32:41.851Z";
            return true;
          }
        })
      );
      return newState;
    }
    case `${namespace}.CREATE_PROBLEM`: {
      const newState = JSON.parse(JSON.stringify(state));
      const courseId = action.payload.courseId;
      const problemId = action.payload.problemId;

      const courseDtoIndex = newState.courses.findIndex((courseDto) =>
        courseDto.course.id === courseId
      );

      // Not learning course
      if (courseDtoIndex === -1) return state;

      const newProblem = {
        id: problemId,
        _learned: false
      };

      newState.courses[courseDtoIndex].problems.push(newProblem);
      return newState;
    }
    case `${namespace}.DELETE_PROBLEM`: {
      const newState = JSON.parse(JSON.stringify(state));
      const courseId = action.payload.courseId;
      const problemId = action.payload.problemId;

      const courseDtoIndex = state.courses.findIndex((courseDto) =>
        courseDto.course.id === courseId
      );

      // Not learning course
      if (courseDtoIndex === -1) return state;

      const problems = newState.courses[courseDtoIndex].problems;
      const newProblems = problems.filter((problem) => problem.id !== problemId);
      newState.courses[courseDtoIndex].problems = newProblems;
      return newState;
    }
    case `${namespace}.LEARN_PROBLEM`: {
      const newState = JSON.parse(JSON.stringify(state));
      const courseId = action.payload.courseId;
      const problemId = action.payload.problemId;

      const courseDtoIndex = state.courses.findIndex((courseDto) =>
        courseDto.course.id === courseId
      );
      newState.courses[courseDtoIndex].problems.find((problem) => {
        if (problem.id === problemId) {
          // todo set actual nextDueDate?
          problem._learned = true;
          problem.nextDueDate = new Date().toISOString();
          problem.ifIgnored = false;
          return true;
        }
      });
      return newState;
    }
    case `${namespace}.IGNORE_PROBLEM`: {
      const problemId = action.payload.problemId;
      const newState = JSON.parse(JSON.stringify(state));
      newState.courses.find((course) =>
        course.problems.find((problem) => {
          if (problem.id === problemId) {
            // todo set actual nextDueDate?
            problem._learned = true;
            problem.nextDueDate = "2044-02-05T21:32:41.851Z";
            problem.ifIgnored = true;
            return true;
          }
        })
      );
      return newState;
    }
    case `${namespace}.STOP_LEARNING_COURSE`: {
      const newState = JSON.parse(JSON.stringify(state));
      const courseId = action.payload.courseId;

      const courseDtoIndex = state.courses.findIndex((courseDto) =>
        courseDto.course.id === courseId
      );

      newState.courses.splice(courseDtoIndex, 1);

      return newState;
    }
    case SPE_CATEGORIES: {
      return { ...state, speCategories: action.spe };
    }
    case `${namespace}.SET`:
      return action.payload;
    default:
      return state;
  }
};

import api from '~/api';

const getActions = (dispatch, getState) => ({
  apiGetCourses: () => {
    // const oldPayload = localStorage.getItem('idsOfProblemsToLearnAndReviewPerCourse');
    // if (oldPayload) {
    //   try {
    //     const parsedOldPayload = JSON.parse(oldPayload);
    //     dispatch({ type: `${namespace}.SET`, payload: parsedOldPayload });
    //   } catch (error) {
    //     console.error(error);
    //     console.log("Couldn't parse apiSync() payload from localStorage");
    //   }
    // }
    api.CourseApi.getMyEverything((spe) => dispatch({ type: SPE_COURSES, spe }));
  },
  apiGetCategories: () => {
    api.CourseCategoryApi.getAll((spe) => dispatch({ type: SPE_CATEGORIES, spe }));
  },
  apiGetCourseForActions: (courseId) => {
    // console.log(getState());
    const oldSpe = getState().global.My.speCourseForActions;
    const isAlreadyLoadedCourse =
      oldSpe.status === 'success' &&
      oldSpe.payload.course.id === courseId;

    if (!isAlreadyLoadedCourse) {
      api.PageApi.getForCourseActions(
        (spe) => dispatch({ type: 'SET_SPE_GET_COURSE', payload: spe }),
        { courseId }
      );
    }
  },
  stopLearningCourse: (courseId) => {
    dispatch({ type: `${namespace}.STOP_LEARNING_COURSE`, payload: { courseId } });
  },
  setSpeCourseForActions: (spe) => {
    dispatch({ type: 'SET_SPE_GET_COURSE', payload: spe });
  },
  reviewProblem: (courseId, problemId) => {
    dispatch({ type: `${namespace}.REVIEW_PROBLEM`, payload: { problemId } });
  },
  createProblem: (courseId, problemId) => {
    dispatch({ type: `${namespace}.CREATE_PROBLEM`, payload: { courseId, problemId } });
  },
  deleteProblem: (courseId, problemId) => {
    dispatch({ type: `${namespace}.DELETE_PROBLEM`, payload: { courseId, problemId } });
  },
  learnProblem: (courseId, problemId) => {
    dispatch({ type: `${namespace}.LEARN_PROBLEM`, payload: { courseId, problemId } });
  },
  ignoreProblem: (courseId, problemId) => {
    dispatch({ type: `${namespace}.IGNORE_PROBLEM`, payload: { courseId, problemId } });
  },
});

// import { createSelector } from 'reselect'

// const getVisibilityFilter = (state) => state.visibilityFilter
// const getTodos = (state) => state.todos


// export const getVisibleTodos = createSelector(
//   [getVisibilityFilter, getTodos],
//   (visibilityFilter, todos) => {
//     switch (visibilityFilter) {
//       case 'SHOW_ALL':
//         return todos
//       case 'SHOW_COMPLETED':
//         return todos.filter(t => t.completed)
//       case 'SHOW_ACTIVE':
//         return todos.filter(t => !t.completed)
//     }
//   }
// )

const selectors = {};

export default { reducer, getActions, selectors };
