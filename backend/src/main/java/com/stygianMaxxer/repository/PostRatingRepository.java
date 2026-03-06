package com.stygianMaxxer.repository;

import com.stygianMaxxer.model.PostRating;
import com.stygianMaxxer.model.PostRatingId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRatingRepository extends JpaRepository<PostRating, PostRatingId> {
}