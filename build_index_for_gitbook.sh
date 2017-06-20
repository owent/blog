#!/bin/bash

echo "# Summary

* [About Me](source/about/index.md)" > SUMMARY.md ;

for YEAR in $(ls source/_posts); do
    MDS=($(cd source/_posts/$YEAR && ls -Q *.md | grep -v README.md));
    if [ ${#MDS} -gt 0 ]; then
        echo "# $YEAR

All articles posted in $YEAR
" > source/_posts/$YEAR/README.md;

        echo ${MDS[@]};
        echo "* [$YEAR](source/_posts/$YEAR/README.md)" >> SUMMARY.md;
        for FILE in ${MDS[@]} ; do
            echo "$FILE";
            
            FILE_NAME=$(basename $FILE);
            CHECK_TITLE=$(grep 'title: ' "source/_posts/$YEAR/$FILE") 2>/dev/null ;
            if [ -z "$CHECK_TITLE" ]; then
                CHECK_TITLE="$FILE_NAME";
            else
                CHECK_TITLE="${CHECK_TITLE:7:}";
            fi

            echo "* [$CHECK_TITLE]($FILE)" >> source/_posts/$YEAR/README.md ;
            echo "  * [$CHECK_TITLE](source/_posts/$YEAR/$FILE)" >> SUMMARY.md ;
        done
    fi
done