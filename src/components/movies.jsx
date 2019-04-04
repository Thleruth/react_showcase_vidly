import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./common/pagination";
import FilterList from "./common/filterList";
import MoviesTable from "./moviesTable";
import SearchBox from "./common/searchBox";
import { getMovies, deleteMovie } from "../services/movieService";
import { paginate } from "../utils/paginate";
import { getGenres } from "../services/genreService";
import _ from "lodash";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    pageSize: 4,
    currentPage: 1,
    selectedGenre: { name: "All Genres", _id: "" },
    searchQuery: "",
    sortColumn: { path: "title", order: "asc" }
  };

  async componentDidMount() {
    const { data } = await getGenres();
    const genres = [{ name: "All Genres", _id: "" }, ...data];
    const { data: movies } = await getMovies();
    this.setState({ movies, genres });
  }

  getPagesData = () => {
    const {
      pageSize,
      currentPage,
      movies: allMovies,
      selectedGenre,
      searchQuery,
      sortColumn
    } = this.state;

    const filteredMovies = searchQuery
      ? allMovies.filter(m =>
          m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
        )
      : selectedGenre && selectedGenre._id
      ? allMovies.filter(m => m.genre._id === selectedGenre._id)
      : allMovies;

    const sortedMovies = _.orderBy(
      filteredMovies,
      [sortColumn.path],
      [sortColumn.order]
    );

    const movies = paginate(sortedMovies, currentPage, pageSize);

    return { totalCount: filteredMovies.length, data: movies };
  };

  handleLike = movie => {
    const movies = this.state.movies;
    const index = movies.indexOf(movie);
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  };

  handleDelete = async movieID => {
    const originalMovies = this.state.movies;
    const movies = originalMovies.filter(m => m._id !== movieID);
    this.setState({ movies });
    try {
      await deleteMovie(movieID);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This movie has already been deleted");
      this.setState({ movies: originalMovies });
    }
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleGenderSelect = genre => {
    this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
  };

  handleSearch = query => {
    this.setState({ selectedGenre: {}, searchQuery: query, currentPage: 1 });
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  render() {
    const {
      pageSize,
      currentPage,
      movies: allMovies,
      genres,
      selectedGenre,
      searchQuery,
      sortColumn
    } = this.state;
    const { length: count } = allMovies;
    const { user } = this.props;

    if (count === 0) {
      return <p>There is no movies in the database.</p>;
    }

    const { totalCount, data: movies } = this.getPagesData();

    return (
      <div className="row">
        <div className="col-2">
          <FilterList
            items={genres}
            selectedItem={selectedGenre}
            onClick={this.handleGenderSelect}
          />
        </div>
        <div className="col">
          {user && (
            <Link
              to="/movies/new"
              className="btn btn-primary"
              style={{ marginBottom: 20 }}
            >
              New Movie
            </Link>
          )}
          <p>Showing {totalCount} movies in the database.</p>
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          <MoviesTable
            movies={movies}
            sortColumn={sortColumn}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Movies;
