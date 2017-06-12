import { Helmet } from 'react-helmet';

import { Header }  from '~/components/Header';
import { Loading } from '~/components/Loading';
import { ListOfCourses } from '~/components/ListOfCourses';
import { ProfileNavigation } from '~/components/ProfileNavigation';

import { ForBeginners } from './components/ForBeginners';

import * as CourseApi from '~/api/Course';

import css from './index.css';

class Page_profile_coursesLearnedByMe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      speGetCourses: {}
    };
  }

  componentDidMount = () => {
    CourseApi.selectAllLearned(
      spe => this.setState({ speGetCourses: spe }),
    );
  }

  render = () =>
    <main className={css.main}>
      <Header/>
      <ProfileNavigation/>
      <div className="container">
        <div className="space"/>
        <Loading spe={this.state.speGetCourses}>{(coursesData) =>
          coursesData.length === 0 ?
            <ForBeginners/> :
            <ListOfCourses coursesData={coursesData}/>
        }</Loading>
      </div>

      <Helmet>
        <title>Profile | Learned Courses</title>
      </Helmet>
    </main>
}

export { Page_profile_coursesLearnedByMe };
