package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.journal.JournalResponse;
import ma.smartypark.smartypark_backend.entity.Journal;
import org.springframework.stereotype.Component;

@Component
public class JournalMapper {

    public JournalResponse toResponse(Journal journal) {
        if (journal == null) {
            return null;
        }

        Long acteurId = null;
        String acteurNom = null;
        String acteurPrenom = null;
        String acteurEmail = null;

        if (journal.getActeur() != null) {
            acteurId = journal.getActeur().getId();
            acteurNom = journal.getActeur().getNom();
            acteurPrenom = journal.getActeur().getPrenom();
            acteurEmail = journal.getActeur().getEmail();
        }

        return JournalResponse.builder()
                .id(journal.getId())
                .dateAction(journal.getDateAction())
                .action(journal.getAction())
                .details(journal.getDetails())
                .acteurId(acteurId)
                .acteurNom(acteurNom)
                .acteurPrenom(acteurPrenom)
                .acteurEmail(acteurEmail)
                .build();
    }
}